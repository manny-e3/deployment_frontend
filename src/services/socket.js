// src/services/socket.js
// Socket.IO Realtime Integration complying with Slipway API - Frontend Integration Guide

import { io } from 'socket.io-client';
import { getAuthToken, refreshSession, api } from './api';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL?.trim() || undefined;

export const socket = io(SOCKET_SERVER_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => {
    cb({ token: getAuthToken() });
  },
});

let sessionEndedHandler = null;
export const setSocketSessionEndedHandler = (fn) => {
  sessionEndedHandler = fn;
};

// Handle authentication failure during socket connect/reconnect
socket.on('connect_error', async (err) => {
  if (err?.message !== 'UNAUTHENTICATED') return; // Socket.IO handles network reconnects by itself

  try {
    const ok = await refreshSession();
    if (ok) {
      socket.auth = { token: getAuthToken() };
      socket.connect();
    } else if (sessionEndedHandler) {
      sessionEndedHandler();
    }
  } catch {
    if (sessionEndedHandler) sessionEndedHandler();
  }
});

/**
 * Connect socket on login or session restore
 */
export const connectSocket = () => {
  socket.auth = { token: getAuthToken() };
  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Disconnect socket on logout
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

/**
 * Robust deploy log and status watcher with monotonic seq tracking and gap repair.
 * Prevents duplicate lines and catches up missed logs on reconnect.
 */
export function watchDeploy(id, { onLines, onFinished }) {
  let lastSeq = 0;
  let loading = Promise.resolve();
  let isCleanedUp = false;

  const fetchAfter = () =>
    (loading = loading.then(async () => {
      if (isCleanedUp) return true;
      for (;;) {
        try {
          const page = await api(`/deployments/${id}/logs`, {
            query: { afterSeq: lastSeq, limit: 5000 },
          });
          if (!page || !page.lines) return true;
          accept(page.lines);
          if (page.lines.length < 5000) return page.finished;
        } catch {
          return true;
        }
      }
    }));

  const accept = (lines) => {
    if (!lines || lines.length === 0 || isCleanedUp) return;
    const fresh = lines
      .filter((l) => l.seq > lastSeq)
      .sort((a, b) => a.seq - b.seq);

    if (fresh.length === 0) return;
    if (fresh[0].seq > lastSeq + 1) {
      // Sequence gap detected: perform catch-up fetch
      fetchAfter();
      return;
    }
    lastSeq = fresh[fresh.length - 1].seq;
    if (onLines) onLines(fresh);
  };

  const join = () => {
    if (socket.connected) {
      socket.emit('deployment:join', { id }, (ack) => {
        if (ack && !ack.ok) console.warn('deployment:join failed for', id);
      });
    }
  };

  const onLogs = (msg) => {
    if (msg && msg.id === id && Array.isArray(msg.lines)) {
      accept(msg.lines);
    }
  };

  const onStatus = async (msg) => {
    if (!msg || msg.id !== id || ['QUEUED', 'RUNNING'].includes(msg.status)) return;
    await fetchAfter(); // pick up the final lines
    if (onFinished && !isCleanedUp) {
      try {
        const fullDeploy = await api(`/deployments/${id}`);
        onFinished(fullDeploy);
      } catch (err) {
        console.error('Error fetching final deployment details:', err);
      }
    }
  };

  const onReconnect = () => {
    join();
    fetchAfter();
  };

  socket.on('deployment:logs', onLogs);
  socket.on('deployment:status', onStatus);
  socket.on('connect', onReconnect);

  join();
  fetchAfter().then(async (finished) => {
    if (finished && onFinished && !isCleanedUp) {
      try {
        const fullDeploy = await api(`/deployments/${id}`);
        onFinished(fullDeploy);
      } catch {
        // Log finished or endpoint offline
      }
    }
  });

  return () => {
    isCleanedUp = true;
    if (socket.connected) {
      socket.emit('deployment:leave', { id });
    }
    socket.off('deployment:logs', onLogs);
    socket.off('deployment:status', onStatus);
    socket.off('connect', onReconnect);
  };
}

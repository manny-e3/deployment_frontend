// src/services/api.js
// Production Fetch Wrapper complying with Deploy Portal API - Frontend Integration Guide

const BASE = '/api/v1';
const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(status, body, requestId) {
    super(body?.error?.message ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code ?? 'HTTP_ERROR';
    this.details = body?.error?.details;
    this.requestId = requestId;
  }
}

export const getCsrfToken = () =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith('csrf_token='))
    ?.split('=')[1];

let onSessionEndedCallback = null;
export const setOnSessionEnded = (fn) => {
  onSessionEndedCallback = fn;
};

const onSessionEnded = () => {
  if (onSessionEndedCallback) {
    onSessionEndedCallback();
  }
};

async function send(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v != null) url.searchParams.set(k, v);
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (WRITE.has(method) && path !== '/auth/login') {
    headers['X-CSRF-Token'] = decodeURIComponent(getCsrfToken() ?? '');
  }

  return fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  });
}

let refreshing = null; // one refresh shared by every request that hit 401
export const refreshSession = () =>
  (refreshing ??= send('/auth/refresh', { method: 'POST' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => (refreshing = null)));

export async function api(path, options = {}) {
  let res = await send(path, options);
  const isAuthCall = path === '/auth/login' || path === '/auth/refresh';

  if (res.status === 401 && !isAuthCall && (await refreshSession())) {
    res = await send(path, options); // retry once with the new cookies
  }

  if (res.status === 401 && !isAuthCall) {
    onSessionEnded();
  }

  const requestId = res.headers.get('X-Request-Id');
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data, requestId);
  }

  return data;
}

/**
 * Utility to map details.fields from 400 VALIDATION_FAILED to input field errors
 * Strips the 'body.' prefix so field names match form inputs directly.
 */
export function mapValidationErrors(details) {
  if (!details?.fields || !Array.isArray(details.fields)) return {};
  const errors = {};
  for (const item of details.fields) {
    const fieldName = item.field?.replace(/^(body|query|params)\./, '') || item.field;
    if (fieldName) {
      errors[fieldName] = item.message;
    }
  }
  return errors;
}

// src/services/api.js
// Production Fetch Wrapper complying with Slipway API - Frontend Integration Guide

const RAW_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.BACKEND_URL
)?.trim();
const BASE = RAW_URL ? `${RAW_URL.replace(/\/$/, '')}/api/v1` : '/api/v1';
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

const TOKEN_KEY = 'deploy_portal_token';
const REFRESH_TOKEN_KEY = 'deploy_portal_refresh_token';

let inMemoryToken = localStorage.getItem(TOKEN_KEY) || null;
let inMemoryRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || null;
let inMemoryCsrfToken = null;

export const getAuthToken = () => inMemoryToken || localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => inMemoryRefreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAuthTokens = ({ accessToken, refreshToken } = {}) => {
  if (accessToken) {
    inMemoryToken = accessToken;
    localStorage.setItem(TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    inMemoryRefreshToken = refreshToken;
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = () => {
  inMemoryToken = null;
  inMemoryRefreshToken = null;
  inMemoryCsrfToken = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setCsrfToken = (token) => {
  if (token) inMemoryCsrfToken = token;
};

export const getCsrfToken = () =>
  inMemoryCsrfToken ||
  document.cookie
    .split('; ')
    .find((c) => c.startsWith('csrf_token=') || c.startsWith('_csrf='))
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
  const url = RAW_URL ? new URL(BASE + path) : new URL(BASE + path, window.location.origin);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v != null) url.searchParams.set(k, v);
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  // Attach Bearer token for cross-origin SPA requests
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (
    WRITE.has(method) &&
    ![
      '/auth/login',
      '/auth/register',
      '/auth/accept-invite',
      '/auth/forgot-password',
      '/auth/reset-password',
    ].includes(path)
  ) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = decodeURIComponent(csrf);
    }
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
  (refreshing ??= (async () => {
    try {
      const rf = getRefreshToken();
      const res = await send('/auth/refresh', {
        method: 'POST',
        body: rf ? { refreshToken: rf } : undefined,
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => null);
      if (data?.accessToken || data?.refreshToken) {
        setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      }
      if (data?.csrfToken || data?.csrf_token) {
        setCsrfToken(data.csrfToken || data.csrf_token);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })());

export async function api(path, options = {}) {
  let res = await send(path, options);
  const isAuthCall = [
    '/auth/login',
    '/auth/register',
    '/auth/confirm-email',
    '/auth/resend-confirmation',
    '/auth/accept-invite',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-reset-token',
  ].includes(path);

  // Automatically capture CSRF token if returned in header
  const csrfHeader = res.headers.get('X-CSRF-Token') || res.headers.get('x-csrf-token');
  if (csrfHeader) {
    setCsrfToken(csrfHeader);
  }

  if (res.status === 401 && !isAuthCall && (await refreshSession())) {
    res = await send(path, options); // retry once with the new token
  }

  if (res.status === 401 && !isAuthCall) {
    clearAuthTokens();
    onSessionEnded();
  }

  const requestId = res.headers.get('X-Request-Id');
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  // Automatically capture returned tokens & CSRF from response body
  if (data?.accessToken || data?.refreshToken) {
    setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  }

  if (data?.csrfToken || data?.csrf_token) {
    setCsrfToken(data.csrfToken || data.csrf_token);
  }

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

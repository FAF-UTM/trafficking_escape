// Fetch wrapper for the backend.
//
// Authentication is an HttpOnly session cookie set by the backend: this code never sees, stores or
// sends a token itself. Because the browser attaches that cookie automatically, every state-changing
// request carries a CSRF token, which is fetched from the backend and kept in memory only.

/**
 * API origin. Empty means "same origin as the page" (Vite proxies /api in development, the web
 * server does in production). Set VITE_BACKEND only when the API lives on another origin of the
 * same site, e.g. https://backend.traffickingescape.com next to https://traffickingescape.com.
 */
export const API_BASE: string = import.meta.env.VITE_BACKEND ?? '';

/** Fired on window when the backend rejects our session; AuthContext signs the user out. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

/**
 * An error response from the backend. `detail` comes from the RFC 9457 problem body
 * the backend returns; `retryAfter` is set for 429 responses.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | null;
  readonly code: string | null;
  readonly retryAfter: number | null;

  constructor(
    status: number,
    detail: string | null,
    code: string | null,
    retryAfter: number | null
  ) {
    super(detail ?? `Request failed with status ${status}`);
    this.status = status;
    this.detail = detail;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

/** True when the request never reached the backend (offline, CORS, server down). */
export const isNetworkError = (e: unknown) => e instanceof TypeError;

interface CsrfToken {
  headerName: string;
  token: string;
}

let csrf: Promise<CsrfToken> | null = null;

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function fetchCsrf(): Promise<CsrfToken> {
  csrf ??= fetch(`${API_BASE}/api/v1/auth/csrf`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then((res) => {
      if (!res.ok) throw new ApiError(res.status, null, null, null);
      return res.json() as Promise<CsrfToken>;
    })
    .catch((e) => {
      csrf = null; // let the next request try again
      throw e;
    });
  return csrf;
}

async function toApiError(res: Response): Promise<ApiError> {
  let detail: string | null = null;
  let code: string | null = null;
  try {
    const problem = await res.json();
    detail = typeof problem?.detail === 'string' ? problem.detail : null;
    code = typeof problem?.code === 'string' ? problem.code : null;
  } catch {
    /* body was not JSON */
  }
  const retryAfter = res.headers.get('Retry-After');
  return new ApiError(
    res.status,
    detail,
    code,
    retryAfter ? Number(retryAfter) : null
  );
}

interface ApiOptions extends Omit<RequestInit, 'body' | 'credentials'> {
  body?: unknown;
}

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;
  const method = (rest.method ?? 'GET').toUpperCase();

  const send = async () => {
    const token = SAFE_METHODS.has(method) ? null : await fetchCsrf();
    return fetch(`${API_BASE}${path}`, {
      ...rest,
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { [token.headerName]: token.token } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await send();
  let error = res.ok ? null : await toApiError(res);

  // The CSRF cookie may have expired or been cleared: get a fresh token and try once more.
  if (error?.status === 403 && error.code === 'csrf') {
    csrf = null;
    res = await send();
    error = res.ok ? null : await toApiError(res);
  }

  if (error) {
    if (error.status === 401) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw error;
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Fire-and-forget POST that survives page navigation (used for anonymous play-time
 * statistics; the backend exempts that endpoint from CSRF because beacons cannot set headers).
 */
export function sendBeaconJson(path: string, payload: unknown) {
  const url = `${API_BASE}${path}`;
  const blob = new Blob([JSON.stringify(payload)], {
    type: 'application/json',
  });
  if (navigator.sendBeacon?.(url, blob)) return;
  fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

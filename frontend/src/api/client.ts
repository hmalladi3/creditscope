import { clearSession, getSession } from '../auth/tokenStorage'
import type { ApiErrorBody } from '../types/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** @spec AUTH-UI-004 — fired whenever a 401/403 clears the stored session, so React state can react. */
export const SESSION_CLEARED_EVENT = 'creditscope:session-cleared'

// @spec API-ERR-001, API-ERR-002, API-ERR-003, API-ERR-004
export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

interface ApiFetchOptions {
  /** @spec FE-UI-016 */
  onSlowRequest?: () => void
  slowThresholdMs?: number
}

// @spec AUTH-UI-003, AUTH-UI-004, FE-UI-016
export async function apiFetch<T>(path: string, init: RequestInit = {}, opts: ApiFetchOptions = {}): Promise<T> {
  const session = getSession()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  }

  const slowTimer = opts.onSlowRequest
    ? setTimeout(opts.onSlowRequest, opts.slowThresholdMs ?? 5000)
    : undefined

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } finally {
    if (slowTimer) clearTimeout(slowTimer)
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      // Non-JSON error body (e.g. a raw 401 from the security filter chain,
      // which never reaches our @RestControllerAdvice) — status alone is still usable.
    }
    if (response.status === 401 || response.status === 403) {
      clearSession()
      window.dispatchEvent(new Event(SESSION_CLEARED_EVENT))
    }
    throw new ApiError(response.status, body)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

// @spec FE-UI-016
// Render's free tier doesn't hang a request while the container cold-starts — its
// edge proxy fails fast with a 502/503/504 (observed directly against the live
// deploy) until the origin is reachable. A network-level failure (fetch rejecting
// outright, e.g. connection refused mid-boot) shows up as a non-ApiError TypeError.
// Either shape means "still waking up, keep retrying" rather than "genuinely broken."
export function isRetryableColdStartError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 502 || error.status === 503 || error.status === 504;
  }
  return error instanceof TypeError;
}

// Exported so the QueryClient in main.tsx (React Query's own retry loop covers
// every other request) and this module's manual retry loop (for the login call,
// which happens before React Query is even relevant) share one retry budget.
export const COLD_START_MAX_RETRIES = 12;
export const coldStartRetryDelayMs = (attemptIndex: number) => Math.min(1000 * 1.5 ** attemptIndex, 6000);

/**
 * A cold-start-shaped error that's still failing after the full retry budget is
 * genuinely ambiguous from the UI's perspective — either "this cold start is
 * unusually slow" or "this isn't a cold start at all" (most commonly CORS: a
 * blocked preflight surfaces to fetch() as a bare TypeError, indistinguishable
 * client-side from a dropped connection). The end-user message stays generic;
 * this console hint is what turns a long "why won't this load" investigation
 * into a short one — exactly the gap that made a real CORS misconfiguration
 * look like an endless cold start when this app was first deployed live.
 */
export function logColdStartExhausted(label: string, error: unknown): void {
  console.error(
    `[creditscope] "${label}" gave up after ${COLD_START_MAX_RETRIES} retries with a ` +
      `${error instanceof TypeError ? 'network-level failure (no HTTP response reached the browser)' : 'server error'}. ` +
      'If the backend is confirmed reachable (e.g. via curl) and this keeps happening, check for a CORS ' +
      'misconfiguration — CORS_ALLOWED_ORIGINS on the backend must exactly match this site\'s origin.',
    error,
  );
}

/**
 * @spec FE-UI-016
 * For callers outside TanStack Query (currently just login) that still need the
 * same cold-start resilience React Query gives every other request. `onSlowRequest`
 * fires immediately on entering the retry loop — each individual retry attempt
 * resolves fast (Render's proxy fails a cold-start request with a quick 503 rather
 * than hanging it), so a per-attempt "still pending after 5s" timer would never
 * fire; "we're already retrying" is the real signal here, same as the wiring in
 * DashboardPage/CompanyDetailPage for their TanStack Query-managed requests.
 */
export async function withColdStartRetry<T>(
  fn: (opts: { onSlowRequest?: () => void }) => Promise<T>,
  label: string,
  onSlowRequest?: () => void,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn({ onSlowRequest });
    } catch (error) {
      if (!isRetryableColdStartError(error) || attempt >= COLD_START_MAX_RETRIES) {
        if (isRetryableColdStartError(error)) logColdStartExhausted(label, error);
        throw error;
      }
      onSlowRequest?.();
      await new Promise((resolve) => setTimeout(resolve, coldStartRetryDelayMs(attempt)));
    }
  }
}

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

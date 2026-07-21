import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeSession } from '../auth/tokenStorage'
import { ApiError, apiFetch } from './client'

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // @spec AUTH-UI-003
  it('omits the Authorization header when no session is stored', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    await apiFetch('/api/companies')
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>)?.Authorization).toBeUndefined()
  })

  // @spec AUTH-UI-003
  it('attaches Authorization: Bearer <token> when a session is stored', async () => {
    storeSession({ token: 'abc123', username: 'admin', role: 'ADMIN', expiresAt: '2099-01-01T00:00:00Z' })
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    await apiFetch('/api/companies')
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer abc123')
  })

  // @spec AUTH-UI-004
  it('clears the session and throws a distinguishable error on 401', async () => {
    storeSession({ token: 'abc123', username: 'admin', role: 'ADMIN', expiresAt: '2099-01-01T00:00:00Z' })
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 401, error: 'Unauthorized', message: 'x', path: '/', timestamp: '', fieldErrors: [] }), {
        status: 401,
      }),
    )
    await expect(apiFetch('/api/companies')).rejects.toBeInstanceOf(ApiError)
    const { getSession } = await import('../auth/tokenStorage')
    expect(getSession()).toBeNull()
  })

  it('does not clear the session on a plain 404 (only 401/403 imply an auth problem)', async () => {
    storeSession({ token: 'abc123', username: 'admin', role: 'ADMIN', expiresAt: '2099-01-01T00:00:00Z' })
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 404, error: 'Not Found', message: 'x', path: '/', timestamp: '', fieldErrors: [] }), {
        status: 404,
      }),
    )
    await expect(apiFetch('/api/companies/does-not-exist')).rejects.toBeInstanceOf(ApiError)
    const { getSession } = await import('../auth/tokenStorage')
    expect(getSession()).not.toBeNull()
  })

  // @spec FE-UI-016
  it('reports a slow request past the wake-up threshold via onSlowRequest', async () => {
    vi.useFakeTimers()
    let resolveFetch: (r: Response) => void
    vi.mocked(fetch).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }) as Promise<Response>,
    )
    const onSlowRequest = vi.fn()
    const promise = apiFetch('/api/companies', {}, { onSlowRequest, slowThresholdMs: 5000 })
    await vi.advanceTimersByTimeAsync(5001)
    expect(onSlowRequest).toHaveBeenCalledTimes(1)
    resolveFetch!(new Response('{}', { status: 200 }))
    await promise
    vi.useRealTimers()
  })
})

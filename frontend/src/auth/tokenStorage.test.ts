import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, getSession, storeSession } from './tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // @spec AUTH-UI-002
  it('returns null when nothing is stored', () => {
    expect(getSession()).toBeNull()
  })

  // @spec AUTH-UI-002
  it('round-trips a stored session', () => {
    storeSession({ token: 't123', username: 'admin', role: 'ADMIN', expiresAt: '2026-01-01T00:00:00Z' })
    expect(getSession()).toEqual({
      token: 't123',
      username: 'admin',
      role: 'ADMIN',
      expiresAt: '2026-01-01T00:00:00Z',
    })
  })

  // @spec AUTH-UI-004
  it('clears the stored session', () => {
    storeSession({ token: 't123', username: 'admin', role: 'ADMIN', expiresAt: '2026-01-01T00:00:00Z' })
    clearSession()
    expect(getSession()).toBeNull()
  })

  // Corrupted/manually-edited localStorage content must not crash the app — treated
  // as "no session" and implicitly cleared, same as if the user had never logged in.
  it('treats corrupted stored JSON as no session', () => {
    localStorage.setItem('creditscope.session', '{not valid json')
    expect(getSession()).toBeNull()
  })
})

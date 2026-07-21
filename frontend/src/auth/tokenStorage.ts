import type { Role } from '../types/api'

const STORAGE_KEY = 'creditscope.session'

export interface Session {
  token: string
  username: string
  role: Role
  expiresAt: string
}

// @spec AUTH-UI-002
// localStorage (not an httpOnly cookie): frontend and backend are different origins
// in the live deployment, and the cross-origin-cookie config that would require is
// unjustified complexity for a demo whose data is synthetic — see docs/llds/auth.md.
export function storeSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

// @spec AUTH-UI-004
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, SESSION_CLEARED_EVENT, withColdStartRetry } from '../api/client'
import type { LoginResponse } from '../types/api'
import { clearSession, getSession, storeSession, type Session } from './tokenStorage'

interface AuthContextValue {
  session: Session | null
  isAdmin: boolean
  login: (username: string, password: string, onSlowRequest?: () => void) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// @spec AUTH-UI-001, AUTH-UI-002, AUTH-UI-004, AUTH-UI-005, FE-UI-016
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession())
  const navigate = useNavigate()

  useEffect(() => {
    const onSessionCleared = () => {
      setSession(null)
      navigate('/login')
    }
    window.addEventListener(SESSION_CLEARED_EVENT, onSessionCleared)
    return () => window.removeEventListener(SESSION_CLEARED_EVENT, onSessionCleared)
  }, [navigate])

  const login = async (username: string, password: string, onSlowRequest?: () => void) => {
    // Login happens outside TanStack Query (it's an imperative call, not a
    // rendered query), so it needs its own cold-start retry — otherwise a login
    // attempt during a cold start fails immediately with a generic error instead
    // of riding out the wake-up like every other request does.
    const response = await withColdStartRetry(
      (opts) =>
        apiFetch<LoginResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        }, opts),
      'login',
      onSlowRequest,
    )
    const next: Session = response
    storeSession(next)
    setSession(next)
  }

  const logout = () => {
    clearSession()
    setSession(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAdmin: session?.role === 'ADMIN', login, logout }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

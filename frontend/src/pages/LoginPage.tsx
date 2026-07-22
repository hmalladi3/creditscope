import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'

// @spec AUTH-UI-001
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'Invalid username or password.' : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="login-username" className="mb-1 block text-xs text-(--color-ink-muted)">Username</label>
          <input
            id="login-username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-(--color-accent-ring)"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-xs text-(--color-ink-muted)">Password</label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-(--color-accent-ring)"
          />
        </div>
        {error && <p role="alert" className="text-sm text-(--color-critical)">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-(--color-accent) px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  )
}

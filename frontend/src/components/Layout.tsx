import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// @spec AUTH-UI-005
export function Layout() {
  const { session, logout } = useAuth()

  return (
    <div className="min-h-screen bg-(--color-page) text-(--color-ink)">
      <header className="border-b border-(--color-border) bg-(--color-surface)">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            CreditScope
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {session ? (
              <>
                <span className="text-(--color-ink-secondary)">
                  {session.username} <span className="text-(--color-ink-muted)">({session.role})</span>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-accent-ring)"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md border border-(--color-border) px-3 py-1.5 hover:bg-(--color-accent-ring)"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

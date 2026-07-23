import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAddRating, useCompany, useDeleteCompany, useUpdateCompany } from '../api/queries'
import { useAuth } from '../auth/AuthContext'
import { RatingTrendChart } from '../components/RatingTrendChart'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'
import { CompanyForm } from '../components/CompanyForm'
import { RatingForm } from '../components/RatingForm'
import { useWakingUpBanner, WakingUpBanner } from '../components/WakingUpBanner'
import { ApiError } from '../api/client'

// @spec FE-UI-006, FE-UI-009
export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [addingRating, setAddingRating] = useState(false)
  const banner = useWakingUpBanner()

  const isWellFormedUuid = !!id && /^[0-9a-f-]{36}$/i.test(id)

  const companyQuery = useCompany(isWellFormedUuid ? id : undefined, banner.onSlowRequest)
  const updateCompany = useUpdateCompany(id ?? '')
  const deleteCompany = useDeleteCompany()
  const addRating = useAddRating(id ?? '')

  // See DashboardPage — Render's cold start fails fast rather than hanging, so the
  // real "still waking up" signal is "currently retrying after a failure."
  const retrying = companyQuery.isFetching && companyQuery.failureCount > 0
  useEffect(() => {
    if (retrying) banner.onSlowRequest()
  }, [retrying, banner.onSlowRequest])

  const settled = companyQuery.isSuccess || companyQuery.isError
  useEffect(() => {
    if (settled) banner.reset()
  }, [settled, banner.reset])

  if (!isWellFormedUuid) {
    return <ErrorState message="Company not found." onRetry={() => navigate('/')} />
  }

  return (
    <div>
      <WakingUpBanner waking={banner.waking} longWait={banner.longWait} />
      <Link to="/" className="mb-4 inline-block text-sm text-(--color-accent) hover:underline">
        ← Back
      </Link>

      {companyQuery.isLoading && <LoadingSkeleton rows={4} />}

      {companyQuery.isError && (
        <ErrorState
          message={
            companyQuery.error instanceof ApiError && companyQuery.error.status === 404
              ? 'This company could not be found.'
              : 'Failed to load company.'
          }
          onRetry={() => companyQuery.refetch()}
        />
      )}

      {companyQuery.isSuccess && !editing && (
        <>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {companyQuery.data.name} <span className="text-(--color-ink-muted)">({companyQuery.data.ticker})</span>
              </h1>
              <p className="text-sm text-(--color-ink-secondary)">
                {companyQuery.data.sector} &middot; {companyQuery.data.country}
              </p>
              {companyQuery.data.description && (
                <p className="mt-2 max-w-prose text-sm text-(--color-ink-secondary)">{companyQuery.data.description}</p>
              )}
              <p className="mt-2 text-sm">
                Current rating: <span className="font-semibold">{companyQuery.data.currentGrade ?? '—'}</span>
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm hover:bg-(--color-accent-ring)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${companyQuery.data.name}?`)) {
                      deleteCompany.mutate(companyQuery.data.id, { onSuccess: () => navigate('/') })
                    }
                  }}
                  className="rounded-md border border-(--color-critical)/40 px-3 py-1.5 text-sm text-(--color-critical) hover:bg-(--color-critical)/5"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <section className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-(--color-ink-secondary)">Rating trend</h2>
            <RatingTrendChart ratings={companyQuery.data.ratings} />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-(--color-ink-secondary)">Rating history</h2>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setAddingRating((v) => !v)}
                  className="rounded-md border border-(--color-border) px-3 py-1 text-xs hover:bg-(--color-accent-ring)"
                >
                  {addingRating ? 'Cancel' : 'Add rating'}
                </button>
              )}
            </div>
            {addingRating && (
              <div className="mb-3">
                <RatingForm
                  submitting={addRating.isPending}
                  onCancel={() => setAddingRating(false)}
                  onSubmit={(data) => addRating.mutate(data, { onSuccess: () => setAddingRating(false) })}
                />
              </div>
            )}
            <ul className="space-y-1 text-sm">
              {[...companyQuery.data.ratings]
                .sort((a, b) => b.ratingDate.localeCompare(a.ratingDate))
                .map((r) => (
                  <li key={r.id} className="flex justify-between border-b border-(--color-gridline) py-1.5">
                    <span>
                      <span className="font-medium">{r.grade}</span> ({r.outlook.toLowerCase()})
                      {r.rationale && <span className="text-(--color-ink-secondary)"> — {r.rationale}</span>}
                    </span>
                    <span className="text-(--color-ink-muted)">{r.ratingDate}</span>
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}

      {companyQuery.isSuccess && editing && (
        <CompanyForm
          initial={companyQuery.data}
          submitting={updateCompany.isPending}
          onCancel={() => setEditing(false)}
          onSubmit={(data) => updateCompany.mutate(data, { onSuccess: () => setEditing(false) })}
        />
      )}
    </div>
  )
}

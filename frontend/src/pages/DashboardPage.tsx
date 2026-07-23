import { useEffect, useState } from 'react'
import { useCompanies, useCreateCompany, useRatingDistribution } from '../api/queries'
import { useCompanyListParams } from '../hooks/useCompanyListParams'
import { useAuth } from '../auth/AuthContext'
import { FilterBar } from '../components/FilterBar'
import { CompanyTable } from '../components/CompanyTable'
import { Pagination } from '../components/Pagination'
import { RatingDistributionChart } from '../components/RatingDistributionChart'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { CompanyForm } from '../components/CompanyForm'
import { useWakingUpBanner, WakingUpBanner } from '../components/WakingUpBanner'
import { ApiError } from '../api/client'

// @spec FE-UI-001, FE-DATA-001
export function DashboardPage() {
  const { params, setFilter, setPage } = useCompanyListParams()
  const { isAdmin } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const banner = useWakingUpBanner()

  const companiesQuery = useCompanies(params, banner.onSlowRequest)
  const distributionQuery = useRatingDistribution(banner.onSlowRequest)
  const createCompany = useCreateCompany()

  // Render's cold start fails fast (502/503/504) rather than hanging a single
  // request, so the "still pending after 5s" signal above never fires during a
  // cold start — the real signal is "currently retrying after a failure." See
  // isRetryableColdStartError and the QueryClient retry config in main.tsx.
  const retrying = (companiesQuery.isFetching && companiesQuery.failureCount > 0)
    || (distributionQuery.isFetching && distributionQuery.failureCount > 0)
  useEffect(() => {
    if (retrying) banner.onSlowRequest()
  }, [retrying, banner.onSlowRequest])

  const settled = companiesQuery.isSuccess || companiesQuery.isError
  useEffect(() => {
    if (settled) banner.reset()
  }, [settled, banner.reset])

  const handleSort = (field: string) => {
    const [activeField, activeDir] = params.sort.split(',')
    const nextDir = activeField === field && activeDir !== 'desc' ? 'desc' : undefined
    setFilter({ sort: nextDir ? `${field},desc` : field })
  }

  const hasActiveFilters = !!(params.search || params.sector || params.country || params.grade)

  return (
    <div>
      <WakingUpBanner waking={banner.waking} longWait={banner.longWait} />

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-medium text-(--color-ink-secondary)">Rating distribution</h2>
        {distributionQuery.isLoading && <LoadingSkeleton rows={1} />}
        {distributionQuery.isSuccess && <RatingDistributionChart buckets={distributionQuery.data} />}
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Companies</h1>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm hover:bg-(--color-accent-ring)"
          >
            {showAddForm ? 'Cancel' : 'Add company'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-4">
          <CompanyForm
            submitting={createCompany.isPending}
            onCancel={() => setShowAddForm(false)}
            onSubmit={(data) =>
              createCompany.mutate(data, {
                onSuccess: () => setShowAddForm(false),
              })
            }
          />
        </div>
      )}

      <FilterBar params={params} onChange={setFilter} />

      {companiesQuery.isLoading && <LoadingSkeleton />}

      {companiesQuery.isError && (
        <ErrorState
          message={
            companiesQuery.error instanceof ApiError
              ? companiesQuery.error.message
              : 'Failed to load companies.'
          }
          onRetry={() => companiesQuery.refetch()}
        />
      )}

      {companiesQuery.isSuccess && companiesQuery.data.content.length === 0 && (
        <EmptyState
          title={hasActiveFilters ? 'No companies match these filters.' : 'No companies yet.'}
          action={
            hasActiveFilters
              ? { label: 'Clear filters', onClick: () => setFilter({ search: '', sector: '', country: '', grade: '' }) }
              : undefined
          }
        />
      )}

      {companiesQuery.isSuccess && companiesQuery.data.content.length > 0 && (
        <>
          <CompanyTable companies={companiesQuery.data.content} params={params} onSort={handleSort} />
          <Pagination page={params.page} totalPages={companiesQuery.data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

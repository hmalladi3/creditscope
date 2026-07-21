import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CompanyListParams } from '../api/queries'

const SORT_FIELDS = new Set(['name', 'ticker', 'sector', 'currentGrade'])
const DEFAULT_SIZE = 20

function sanitizeInt(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = value === null ? NaN : Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return fallback
  return parsed
}

function sanitizeSort(value: string | null): string {
  if (!value) return 'name'
  const [field] = value.split(',')
  return SORT_FIELDS.has(field) ? value : 'name'
}

// @spec FE-DATA-002, FE-DATA-003, FE-DATA-005, FE-DATA-006
export function useCompanyListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const params: CompanyListParams = useMemo(
    () => ({
      page: sanitizeInt(searchParams.get('page'), 1, 1, Number.MAX_SAFE_INTEGER),
      size: sanitizeInt(searchParams.get('size'), DEFAULT_SIZE, 1, 100),
      sort: sanitizeSort(searchParams.get('sort')),
      search: searchParams.get('search') ?? '',
      sector: searchParams.get('sector') ?? '',
      country: searchParams.get('country') ?? '',
      grade: searchParams.get('grade') ?? '',
    }),
    [searchParams],
  )

  // Filter/sort/search changes replace the history entry (no back-button spam per
  // keystroke or click) and always reset page to 1, per FE-DATA-003/005.
  const setFilter = useCallback(
    (patch: Partial<Pick<CompanyListParams, 'sort' | 'search' | 'sector' | 'country' | 'grade'>>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', '1')
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (page: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', String(page))
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { params, setFilter, setPage }
}

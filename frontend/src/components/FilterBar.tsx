import { useRef, useState, type ChangeEvent } from 'react'
import { GRADE_ORDER } from '../types/api'
import type { CompanyListParams } from '../api/queries'

// @spec FE-DATA-004
const SEARCH_DEBOUNCE_MS = 300

export function FilterBar({
  params,
  onChange,
}: {
  params: CompanyListParams
  onChange: (patch: Partial<Omit<CompanyListParams, 'page'>>) => void
}) {
  const [searchInput, setSearchInput] = useState(params.search)
  const debounceTimer = useRef<number>(undefined)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    window.clearTimeout(debounceTimer.current)
    debounceTimer.current = window.setTimeout(() => {
      onChange({ search: value })
    }, SEARCH_DEBOUNCE_MS)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        type="search"
        aria-label="Search companies"
        placeholder="Search name or ticker..."
        value={searchInput}
        onChange={handleSearchChange}
        className="min-w-[12rem] flex-1 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-(--color-accent-ring)"
      />
      <select
        aria-label="Filter by grade"
        value={params.grade}
        onChange={(e) => onChange({ grade: e.target.value })}
        className="rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1.5 text-sm"
      >
        <option value="">All grades</option>
        {GRADE_ORDER.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      {(params.search || params.sector || params.country || params.grade) && (
        <button
          type="button"
          onClick={() => {
            setSearchInput('')
            onChange({ search: '', sector: '', country: '', grade: '' })
          }}
          className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm text-(--color-ink-secondary) hover:bg-(--color-accent-ring)"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

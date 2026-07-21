import { Link } from 'react-router-dom'
import type { CompanySummaryDto } from '../types/api'
import type { CompanyListParams } from '../api/queries'

const SORT_COLUMNS: { key: 'name' | 'ticker' | 'sector' | 'currentGrade'; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'ticker', label: 'Ticker' },
  { key: 'sector', label: 'Sector' },
  { key: 'currentGrade', label: 'Grade' },
]

// @spec FE-UI-002, FE-UI-012
export function CompanyTable({
  companies,
  params,
  onSort,
}: {
  companies: CompanySummaryDto[]
  params: CompanyListParams
  onSort: (field: string) => void
}) {
  const [activeField, activeDir] = params.sort.split(',')

  const sortIndicator = (field: string) => {
    if (field !== activeField) return null
    return activeDir === 'desc' ? ' ↓' : ' ↑'
  }

  return (
    <>
      {/* Desktop/tablet: real table. Hidden below 640px in favor of the card list. */}
      <table className="hidden w-full border-collapse text-sm sm:table">
        <thead>
          <tr className="border-b border-(--color-border) text-left text-(--color-ink-muted)">
            {SORT_COLUMNS.map((col) => (
              <th key={col.key} className="py-2 pr-4 font-medium">
                <button type="button" onClick={() => onSort(col.key)} className="hover:text-(--color-ink)">
                  {col.label}
                  {sortIndicator(col.key)}
                </button>
              </th>
            ))}
            <th className="py-2 font-medium">Country</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id} className="border-b border-(--color-gridline) hover:bg-(--color-accent-ring)">
              <td className="py-2 pr-4">
                <Link to={`/companies/${c.id}`} className="text-(--color-accent) hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="py-2 pr-4">{c.ticker}</td>
              <td className="py-2 pr-4">{c.sector}</td>
              <td className="py-2 pr-4">{c.currentGrade ?? '—'}</td>
              <td className="py-2">{c.country}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: stacked cards, not a horizontally-scrolling table. */}
      <ul className="space-y-2 sm:hidden">
        {companies.map((c) => (
          <li key={c.id} className="rounded-lg border border-(--color-border) p-3">
            <Link to={`/companies/${c.id}`} className="font-medium text-(--color-accent)">
              {c.name}
            </Link>
            <div className="mt-1 flex justify-between text-xs text-(--color-ink-secondary)">
              <span>{c.ticker} &middot; {c.sector} &middot; {c.country}</span>
              <span className="font-medium text-(--color-ink)">{c.currentGrade ?? '—'}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

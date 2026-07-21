import { useState, type FormEvent } from 'react'
import { GRADE_ORDER } from '../types/api'
import type { RatingWriteDto } from '../api/queries'

// @spec FE-UI-006
export function RatingForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (data: RatingWriteDto) => void
  onCancel: () => void
  submitting: boolean
}) {
  const [grade, setGrade] = useState(GRADE_ORDER[3])
  const [outlook, setOutlook] = useState<'POSITIVE' | 'STABLE' | 'NEGATIVE'>('STABLE')
  const [ratingDate, setRatingDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rationale, setRationale] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ grade, outlook, ratingDate, rationale })
  }

  const inputClass =
    'w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-(--color-accent-ring)'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-(--color-border) p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rating-grade" className="mb-1 block text-xs text-(--color-ink-muted)">Grade</label>
          <select id="rating-grade" value={grade} onChange={(e) => setGrade(e.target.value as typeof grade)} className={inputClass}>
            {GRADE_ORDER.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rating-outlook" className="mb-1 block text-xs text-(--color-ink-muted)">Outlook</label>
          <select
            id="rating-outlook"
            value={outlook}
            onChange={(e) => setOutlook(e.target.value as typeof outlook)}
            className={inputClass}
          >
            <option value="POSITIVE">Positive</option>
            <option value="STABLE">Stable</option>
            <option value="NEGATIVE">Negative</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="rating-date" className="mb-1 block text-xs text-(--color-ink-muted)">Rating date</label>
        <input id="rating-date" type="date" required value={ratingDate} onChange={(e) => setRatingDate(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="rating-rationale" className="mb-1 block text-xs text-(--color-ink-muted)">Rationale</label>
        <textarea id="rating-rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} className={inputClass} rows={2} />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-(--color-accent) px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add rating'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}

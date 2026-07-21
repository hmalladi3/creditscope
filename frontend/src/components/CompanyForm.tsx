import { useState, type FormEvent } from 'react'
import type { CompanyWriteDto } from '../api/queries'

// @spec FE-UI-006, FE-UI-015
export function CompanyForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Partial<CompanyWriteDto>
  onSubmit: (data: CompanyWriteDto) => void
  onCancel: () => void
  submitting: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [ticker, setTicker] = useState(initial?.ticker ?? '')
  const [sector, setSector] = useState(initial?.sector ?? '')
  const [country, setCountry] = useState(initial?.country ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ name, ticker, sector, country, description })
  }

  const inputClass =
    'w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-(--color-accent-ring)'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-(--color-border) p-4">
      <div>
        <label htmlFor="company-name" className="mb-1 block text-xs text-(--color-ink-muted)">Name</label>
        <input id="company-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="company-ticker" className="mb-1 block text-xs text-(--color-ink-muted)">Ticker</label>
          <input id="company-ticker" required value={ticker} onChange={(e) => setTicker(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="company-sector" className="mb-1 block text-xs text-(--color-ink-muted)">Sector</label>
          <input id="company-sector" required value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="company-country" className="mb-1 block text-xs text-(--color-ink-muted)">Country</label>
        <input id="company-country" required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="company-description" className="mb-1 block text-xs text-(--color-ink-muted)">Description</label>
        <textarea id="company-description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={3} />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-(--color-accent) px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}

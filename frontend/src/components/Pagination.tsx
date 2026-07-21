// @spec FE-UI-002, FE-UI-012
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-(--color-border) px-3 py-1.5 disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-(--color-ink-secondary)">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-(--color-border) px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}

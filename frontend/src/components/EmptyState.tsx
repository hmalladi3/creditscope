// @spec FE-UI-004, FE-UI-005
export function EmptyState({
  title,
  action,
}: {
  title: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-(--color-border) py-16 text-center">
      <p className="text-(--color-ink-secondary)">{title}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm text-(--color-accent) hover:bg-(--color-accent-ring)"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

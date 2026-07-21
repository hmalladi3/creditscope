// @spec FE-UI-011
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-(--color-critical)/30 bg-(--color-critical)/5 py-16 text-center">
      <p className="text-(--color-critical)">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm hover:bg-(--color-accent-ring)"
      >
        Retry
      </button>
    </div>
  )
}

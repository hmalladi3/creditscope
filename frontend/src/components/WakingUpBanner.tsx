import { useCallback, useRef, useState } from 'react'

// @spec FE-UI-016
// onSlowRequest (wired into apiFetch's 5s threshold) flips `waking`; a further 55s
// (60s total) flips `longWait`, escalating the message. `reset()` must be called
// once the request settles (success or error) so the banner doesn't outlive it.
export function useWakingUpBanner() {
  const [waking, setWaking] = useState(false)
  const [longWait, setLongWait] = useState(false)
  const longWaitTimer = useRef<number>(undefined)

  // Idempotent: may be called once per retry attempt during a cold start, but
  // should only ever start a single 55s countdown to the "long wait" escalation.
  const onSlowRequest = useCallback(() => {
    setWaking(true)
    if (longWaitTimer.current === undefined) {
      longWaitTimer.current = window.setTimeout(() => setLongWait(true), 55_000)
    }
  }, [])

  const reset = useCallback(() => {
    window.clearTimeout(longWaitTimer.current)
    longWaitTimer.current = undefined
    setWaking(false)
    setLongWait(false)
  }, [])

  return { onSlowRequest, waking, longWait, reset }
}

export function WakingUpBanner({ waking, longWait }: { waking: boolean; longWait: boolean }) {
  if (!waking) return null
  return (
    <div className="mb-4 rounded-md border border-(--color-accent-ring) bg-(--color-accent-ring) px-3 py-2 text-sm text-(--color-ink-secondary)">
      {longWait
        ? 'The server may be waking up from idle — try refreshing in a moment.'
        : 'Waking up the server, this can take up to a minute…'}
    </div>
  )
}

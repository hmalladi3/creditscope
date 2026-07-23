import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { COLD_START_MAX_RETRIES, coldStartRetryDelayMs, isRetryableColdStartError, logColdStartExhausted } from './api/client.ts'

// @spec FE-UI-016
// Cold-start retries need materially more attempts/backoff than a normal transient
// failure: Render's free tier can take up to ~60s to wake a sleeping container, and
// its proxy fails fast (502/503/504) rather than holding the connection open — see
// isRetryableColdStartError. A non-cold-start error fails immediately (no retry);
// once a request succeeds, staleTime keeps things quiet without needing to be huge.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        isRetryableColdStartError(error) && failureCount < COLD_START_MAX_RETRIES,
      retryDelay: coldStartRetryDelayMs,
      staleTime: 10_000,
    },
  },
  // See logColdStartExhausted — a retryable-shaped error still failing after the
  // full retry budget is ambiguous ("unusually slow cold start" vs. "not a cold
  // start at all, most likely CORS"); this is what surfaces that distinction.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isRetryableColdStartError(error) && query.state.fetchFailureCount >= COLD_START_MAX_RETRIES) {
        logColdStartExhausted(String(query.queryKey[0]), error)
      }
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

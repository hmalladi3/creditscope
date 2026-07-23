import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { isRetryableColdStartError } from './api/client.ts'

// @spec FE-UI-016
// Cold-start retries need materially more attempts/backoff than a normal transient
// failure: Render's free tier can take up to ~60s to wake a sleeping container, and
// its proxy fails fast (502/503/504) rather than holding the connection open — see
// isRetryableColdStartError. A non-cold-start error fails immediately (no retry);
// once a request succeeds, staleTime keeps things quiet without needing to be huge.
const COLD_START_MAX_RETRIES = 12

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        isRetryableColdStartError(error) && failureCount < COLD_START_MAX_RETRIES,
      retryDelay: (attemptIndex) => Math.min(1000 * 1.5 ** attemptIndex, 6000),
      staleTime: 10_000,
    },
  },
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

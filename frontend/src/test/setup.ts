import '@testing-library/jest-dom/vitest'

// Recharts' ResponsiveContainer needs ResizeObserver, which jsdom doesn't implement.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

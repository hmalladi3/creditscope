import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useCompanyListParams } from './useCompanyListParams'
import type { ReactNode } from 'react'

function wrapper(initialEntries: string[]) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  )
}

describe('useCompanyListParams', () => {
  // @spec FE-DATA-002
  it('defaults to page 1, size 20, sort name, no filters when the URL has no params', () => {
    const { result } = renderHook(() => useCompanyListParams(), { wrapper: wrapper(['/']) })
    expect(result.current.params).toEqual({
      page: 1,
      size: 20,
      sort: 'name',
      search: '',
      sector: '',
      country: '',
      grade: '',
    })
  })

  // @spec FE-DATA-006
  it('sanitizes an invalid page/size in the URL to defaults instead of passing them through', () => {
    const { result } = renderHook(() => useCompanyListParams(), {
      wrapper: wrapper(['/?page=-1&size=abc']),
    })
    expect(result.current.params.page).toBe(1)
    expect(result.current.params.size).toBe(20)
  })

  // @spec FE-DATA-006
  it('sanitizes an unknown sort field in the URL to the default', () => {
    const { result } = renderHook(() => useCompanyListParams(), {
      wrapper: wrapper(['/?sort=notAField']),
    })
    expect(result.current.params.sort).toBe('name')
  })

  // @spec FE-DATA-005
  it('resets page to 1 when a filter changes', () => {
    const { result } = renderHook(() => useCompanyListParams(), {
      wrapper: wrapper(['/?page=3']),
    })
    expect(result.current.params.page).toBe(3)
    act(() => {
      result.current.setFilter({ sector: 'Technology' })
    })
    expect(result.current.params.page).toBe(1)
    expect(result.current.params.sector).toBe('Technology')
  })

  // @spec FE-DATA-002
  it('setPage updates only the page param, preserving other filters', () => {
    const { result } = renderHook(() => useCompanyListParams(), {
      wrapper: wrapper(['/?sector=Technology']),
    })
    act(() => {
      result.current.setPage(2)
    })
    expect(result.current.params.page).toBe(2)
    expect(result.current.params.sector).toBe('Technology')
  })
})

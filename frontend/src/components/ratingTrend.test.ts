import { describe, expect, it } from 'vitest'
import { toTrendPoints } from './ratingTrend'
import type { RatingDto } from '../types/api'

function rating(grade: RatingDto['grade'], ratingDate: string): RatingDto {
  return { id: ratingDate + grade, grade, outlook: 'STABLE', ratingDate, rationale: null }
}

describe('toTrendPoints', () => {
  // @spec FE-UI-007
  it('returns an empty array for zero ratings', () => {
    expect(toTrendPoints([])).toEqual([])
  })

  // @spec FE-UI-008
  it('returns a single point for exactly one rating', () => {
    const points = toTrendPoints([rating('BBB', '2024-01-01')])
    expect(points).toHaveLength(1)
    expect(points[0].grade).toBe('BBB')
  })

  // Higher displayValue must mean better credit quality (AAA highest), not
  // alphabetical order — this is the whole point of the ordinal y-axis.
  it('maps better grades to a higher displayValue than worse grades', () => {
    const points = toTrendPoints([rating('AAA', '2024-01-01'), rating('D', '2024-06-01')])
    expect(points[0].displayValue).toBeGreaterThan(points[1].displayValue)
  })

  it('sorts points chronologically regardless of input order', () => {
    const points = toTrendPoints([rating('A', '2025-01-01'), rating('BBB', '2023-01-01')])
    expect(points.map((p) => p.ratingDate)).toEqual(['2023-01-01', '2025-01-01'])
  })
})

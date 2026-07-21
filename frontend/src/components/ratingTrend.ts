import { GRADE_ORDER, gradeRank, type Grade, type RatingDto } from '../types/api'

export interface TrendPoint {
  ratingDate: string
  grade: Grade
  /** Higher = better credit quality (AAA highest), for an intuitive "up is good" y-axis. */
  displayValue: number
}

// @spec FE-UI-007, FE-UI-008
export function toTrendPoints(ratings: RatingDto[]): TrendPoint[] {
  return [...ratings]
    .sort((a, b) => a.ratingDate.localeCompare(b.ratingDate))
    .map((r) => ({
      ratingDate: r.ratingDate,
      grade: r.grade,
      displayValue: GRADE_ORDER.length - 1 - gradeRank(r.grade),
    }))
}

export function displayValueToGrade(value: number): Grade {
  const index = GRADE_ORDER.length - 1 - Math.round(value)
  return GRADE_ORDER[Math.min(Math.max(index, 0), GRADE_ORDER.length - 1)]
}

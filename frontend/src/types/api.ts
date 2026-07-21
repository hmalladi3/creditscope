export type Grade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D'
export type Outlook = 'POSITIVE' | 'STABLE' | 'NEGATIVE'
export type Role = 'VIEWER' | 'ADMIN'

// Ordered worst-to-best index is 9..0; used for the trend chart's ordinal y-axis.
export const GRADE_ORDER: Grade[] = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D']

export function gradeRank(grade: Grade): number {
  return GRADE_ORDER.indexOf(grade)
}

export interface CompanySummaryDto {
  id: string
  name: string
  ticker: string
  sector: string
  country: string
  currentGrade: Grade | null
}

export interface RatingDto {
  id: string
  grade: Grade
  outlook: Outlook
  ratingDate: string
  rationale: string | null
}

export interface CompanyDetailDto {
  id: string
  name: string
  ticker: string
  sector: string
  country: string
  description: string | null
  currentGrade: Grade | null
  ratings: RatingDto[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface RatingDistributionBucket {
  grade: Grade
  count: number
}

export interface LoginResponse {
  token: string
  username: string
  role: Role
  expiresAt: string
}

export interface ApiErrorBody {
  status: number
  error: string
  message: string
  path: string
  timestamp: string
  fieldErrors: { field: string; message: string }[]
}

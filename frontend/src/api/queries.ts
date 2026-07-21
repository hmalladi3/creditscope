import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './client'
import type {
  CompanyDetailDto,
  CompanySummaryDto,
  Page,
  RatingDistributionBucket,
  RatingDto,
} from '../types/api'

export interface CompanyListParams {
  page: number
  size: number
  sort: string
  search: string
  sector: string
  country: string
  grade: string
}

function toQueryString(params: CompanyListParams): string {
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('size', String(params.size))
  if (params.sort) query.set('sort', params.sort)
  if (params.search) query.set('search', params.search)
  if (params.sector) query.set('sector', params.sector)
  if (params.country) query.set('country', params.country)
  if (params.grade) query.set('grade', params.grade)
  return query.toString()
}

// @spec FE-DATA-001, FE-UI-002
export function useCompanies(params: CompanyListParams, onSlowRequest?: () => void) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () =>
      apiFetch<Page<CompanySummaryDto>>(`/api/companies?${toQueryString(params)}`, {}, { onSlowRequest }),
    placeholderData: (previousData) => previousData,
  })
}

// @spec FE-UI-006, FE-UI-009
export function useCompany(id: string | undefined, onSlowRequest?: () => void) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => apiFetch<CompanyDetailDto>(`/api/companies/${id}`, {}, { onSlowRequest }),
    enabled: !!id,
    retry: false,
  })
}

// @spec FE-UI-003
export function useRatingDistribution(onSlowRequest?: () => void) {
  return useQuery({
    queryKey: ['ratings', 'distribution'],
    queryFn: () => apiFetch<RatingDistributionBucket[]>('/api/ratings/distribution', {}, { onSlowRequest }),
  })
}

export interface CompanyWriteDto {
  name: string
  ticker: string
  sector: string
  country: string
  description?: string | null
}

// @spec FE-UI-006 (admin add), API-BE-012
export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CompanyWriteDto) =>
      apiFetch<CompanyDetailDto>('/api/companies', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['ratings', 'distribution'] })
    },
  })
}

// @spec FE-UI-006 (admin edit), API-BE-011
export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CompanyWriteDto) =>
      apiFetch<CompanyDetailDto>(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', id] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

// @spec FE-UI-006 (admin delete)
export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/companies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['ratings', 'distribution'] })
    },
  })
}

export interface RatingWriteDto {
  grade: string
  outlook: string
  ratingDate: string
  rationale?: string
}

// @spec FE-UI-006 (add rating), API-BE-014
export function useAddRating(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RatingWriteDto) =>
      apiFetch<RatingDto>(`/api/companies/${companyId}/ratings`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['ratings', 'distribution'] })
    },
  })
}

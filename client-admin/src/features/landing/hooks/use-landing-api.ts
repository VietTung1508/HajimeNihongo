import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import apiClient from '@/lib/api/apiClient'
import type {LandingData, TestimonialItem} from '../types'

const QUERY_KEY = ['landing']

export function useLandingData() {
  return useQuery<LandingData>({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.get('/landing').then(r => r.data),
  })
}

export function useUpdateSectionConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({sectionKey, content}: {sectionKey: string; content: Record<string, unknown>}) =>
      apiClient.put(`/landing/config/${sectionKey}`, content),
    onSuccess: () => qc.invalidateQueries({queryKey: QUERY_KEY}),
  })
}

export function useUpdateSectionPositions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (positions: {sectionKey: string; position: number}[]) =>
      apiClient.put('/landing/positions', {positions}),
    onSuccess: () => qc.invalidateQueries({queryKey: QUERY_KEY}),
  })
}

export function useCreateTestimonial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<TestimonialItem, 'id' | 'position'>) =>
      apiClient.post('/landing/testimonials', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({queryKey: QUERY_KEY}),
  })
}

export function useUpdateTestimonial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({id, ...data}: Partial<Omit<TestimonialItem, 'id'>> & {id: number}) =>
      apiClient.put(`/landing/testimonials/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({queryKey: QUERY_KEY}),
  })
}

export function useDeleteTestimonial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/landing/testimonials/${id}`),
    onSuccess: () => qc.invalidateQueries({queryKey: QUERY_KEY}),
  })
}

export function useUpdateTestimonialPositions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (positions: {id: number; position: number}[]) =>
      apiClient.put('/landing/testimonials/positions', {positions}),
    onSuccess: () => qc.invalidateQueries({queryKey: QUERY_KEY}),
  })
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      return apiClient
        .post<{url: string}>('/landing/upload', formData, {
          headers: {'Content-Type': 'multipart/form-data'},
        })
        .then(r => r.data.url)
    },
  })
}

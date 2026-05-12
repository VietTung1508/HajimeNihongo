'use client'

import {useQuery} from '@tanstack/react-query'
import {dashboardApi} from '../services/api'

export function useActivity(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['dashboard-activity', startDate, endDate],
    queryFn: () => dashboardApi.getActivity(startDate, endDate),
    staleTime: 5 * 60 * 1000
  })
}

export function useWeakAreas(limit = 5) {
  return useQuery({
    queryKey: ['dashboard-weak-areas', limit],
    queryFn: () => dashboardApi.getWeakAreas(limit),
    staleTime: 60 * 60 * 1000 // 1 hour cache
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 5 * 60 * 1000
  })
}

import { apiClient } from '@/lib/api/apiClient'
import {
  ActivityResponse,
  WeakAreasResponse,
  StatsResponse,
} from '../types'

export const dashboardApi = {
  getActivity: async (startDate?: string, endDate?: string): Promise<ActivityResponse> => {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await apiClient.get<ActivityResponse>('/dashboard/activity', {params})
    return response.data
  },

  getWeakAreas: async (limit = 5): Promise<WeakAreasResponse> => {
    const response = await apiClient.get<WeakAreasResponse>('/dashboard/weak-areas', {
      params: {limit: limit.toString()}
    })
    return response.data
  },

  getStats: async (): Promise<StatsResponse> => {
    const response = await apiClient.get<StatsResponse>('/dashboard/stats')
    return response.data
  },
}

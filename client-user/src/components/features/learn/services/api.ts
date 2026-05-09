import { apiClient } from '@/lib/api/apiClient'

export interface LearnItem {
  id: number
  type: 'word' | 'grammar'
  title: string
  subtitle?: string
  viewedAt: string | null
  masteredAt: string | null
  pushedToReviewAt: string | null
  wordId?: number
  grammarId?: number
}

export interface LearnTodayResponse {
  id: number | null
  generatedDate: string
  status: string
  completedAt: string | null
  items: LearnItem[]
  isExtraBatch?: boolean
}

export interface ItemStatusResponse {
  canView: boolean
  viewedAt: string | null
}

export interface PushToReviewResponse {
  pushed: number
  message?: string
}

export interface StreakResponse {
  currentStreak: number
  longestStreak: number
  freezeAvailableAt: string | null
  lastCompletedDate: string | null
}

export interface GenerateDailyLearnResponse {
  id: number
  generatedDate: string
  status: string
  items: LearnItem[]
  message?: string
  isExtraBatch?: boolean
}

export const learnApi = {
  getTodayLearn: async (): Promise<LearnTodayResponse> => {
    const response = await apiClient.get<LearnTodayResponse>('/learn/today')
    return response.data
  },

  markItemAsViewed: async (itemId: number): Promise<{viewedAt: string}> => {
    const response = await apiClient.post<{viewedAt: string}>(`/learn/items/${itemId}/view`)
    return response.data
  },

  checkItemStatus: async (itemId: number): Promise<ItemStatusResponse> => {
    const response = await apiClient.get<ItemStatusResponse>(`/learn/items/${itemId}/status`)
    return response.data
  },

  pushToReview: async (): Promise<PushToReviewResponse> => {
    const response = await apiClient.post<PushToReviewResponse>('/learn/push-to-review')
    return response.data
  },

  getStreak: async (): Promise<StreakResponse> => {
    const response = await apiClient.get<StreakResponse>('/learn/streak')
    return response.data
  },

  generateDailyLearn: async (): Promise<GenerateDailyLearnResponse> => {
    const response = await apiClient.post<GenerateDailyLearnResponse>('/learn/generate')
    return response.data
  },

  generateExtraBatch: async (): Promise<GenerateDailyLearnResponse> => {
    const response = await apiClient.post<GenerateDailyLearnResponse>('/learn/generate-extra')
    return response.data
  },
}

import apiClient from './apiClient'

export interface AdminDashboardStats {
  totalUsers: number
  totalVocabulary: number
  totalGrammar: number
  totalKana: number
}

export interface AdminDashboardAccount {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface TopBookmarkedVocab {
  id: number
  kanji: string | null
  reading: string
  count: number
}

export interface TopBookmarkedGrammar {
  id: number
  grammarPoint: string
  level: string
  count: number
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats
  recentAccounts: AdminDashboardAccount[]
  contentHealth: {
    vocabByLevel: Record<string, number>
    grammarByLevel: Record<string, number>
  }
  learningInsights: {
    usersByJlptTarget: Record<string, number>
    studyPaceDistribution: Record<string, number>
  }
  topBookmarkedVocab: TopBookmarkedVocab[]
  topBookmarkedGrammar: TopBookmarkedGrammar[]
}

export const adminDashboardApi = {
  get: async (): Promise<AdminDashboardResponse> => {
    const res = await apiClient.get<AdminDashboardResponse>('/admin/dashboard')
    return res.data
  },
}

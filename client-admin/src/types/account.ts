export interface AccountListItem {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  gender: string | null
  createdAt: string
  lastLoginAt: string | null
  onboarding: {
    level: string | null
    studyPace: string | null
  } | null
}

export interface AccountListResponse {
  data: AccountListItem[]
  total: number
  page: number
  limit: number
}

export interface AccountProfile {
  id: string
  username: string
  email: string
  phone: string | null
  avatarUrl: string | null
  gender: string | null
  dateOfBirth: string | null
  createdAt: string
  lastLoginAt: string | null
  roles: { id: string; name: string }[]
}

export interface AccountOnboarding {
  level: string | null
  studyPace: string | null
  studyPreference: string
  hasTakenPlacementTest: boolean
  placementTestCompletedAt: string | null
}

export interface AccountStats {
  currentStreak: number
  longestStreak: number
  wordsLearned: number
  grammarLearned: number
  totalReviews: number
  correctReviews: number
  accuracyPercent: number
  dailyLearnSessions: number
}

export interface AccountDetail {
  profile: AccountProfile
  onboarding: AccountOnboarding | null
  stats: AccountStats
}

export interface AccountFilters {
  search?: string
  level?: string
  studyPace?: string
  page?: number
  limit?: number
}

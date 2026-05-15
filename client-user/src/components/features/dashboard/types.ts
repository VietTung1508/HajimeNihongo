export interface ActivityDataPoint {
  date: string
  count: number
}

export interface ActivityResponse {
  data: ActivityDataPoint[]
}

export interface WeakAreaItem {
  id: number
  type: 'word' | 'grammar'
  accuracy: number
  japanese: string
  meaning?: string
}

export interface WeakAreasResponse {
  data: WeakAreaItem[]
}

export interface JLPTProgress {
  N5: {mastered: number; total: number; isMastered?: boolean; isWaived?: boolean}
  N4: {mastered: number; total: number; isMastered?: boolean; isWaived?: boolean}
  N3: {mastered: number; total: number; isMastered?: boolean; isWaived?: boolean}
  N2: {mastered: number; total: number; isMastered?: boolean; isWaived?: boolean}
  N1: {mastered: number; total: number; isMastered?: boolean; isWaived?: boolean}
}

export interface StatsResponse {
  currentStreak: number
  longestStreak: number
  jlptProgress: JLPTProgress
  daysStudied: number
  lastSessionAccuracy: number
  lastSessionDate: string | null
  totalItemsStudied: number
}

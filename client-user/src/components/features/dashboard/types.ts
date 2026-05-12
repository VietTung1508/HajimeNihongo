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
  N5: {mastered: number; total: number}
  N4: {mastered: number; total: number}
  N3: {mastered: number; total: number}
  N2: {mastered: number; total: number}
  N1: {mastered: number; total: number}
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

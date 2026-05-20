export interface VocabMeaning {
  id: number
  text: string
}

export interface VocabExample {
  id: number
  sentence: string
  translation: string
  audioUrl?: string
}

export interface VocabListItem {
  id: number
  kanji: string | null
  reading: string
  meanings: VocabMeaning[]
  jlptLevel: number | null
  isCommon: boolean
}

export interface VocabListResponse {
  data: VocabListItem[]
  total: number
  page: number
  limit: number
}

export interface VocabDetail extends VocabListItem {
  entSeq: number
  audioUrl?: string
  examples: VocabExample[]
}

export interface VocabFilters {
  q?: string
  level?: number
  commonOnly?: boolean
  page?: number
  limit?: number
}

export interface CreateWordPayload {
  reading: string
  kanji?: string
  jlptLevel?: number | null
  isCommon?: boolean
  meanings: string[]
}

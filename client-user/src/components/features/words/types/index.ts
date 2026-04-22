export interface WordDTO {
  id: number
  kanji: string | null
  reading: string
  meanings: string[]
  jlptLevel: number | null // 1–5
  isCommon: boolean
}

export interface WordListResponse {
  data: WordDTO[]
  total: number
  page: number
  limit: number
}

export interface WordDetailDTO {
  id: number
  entSeq: number
  kanji: string | null
  reading: string
  isCommon: boolean
  jlptLevel: number | null
  audioUrl?: string
  meanings: {
    id: number
    text: string
  }[]
  examples: {
    id: number
    sentence: string
    translation: string
    audioUrl?: string
  }[]
}

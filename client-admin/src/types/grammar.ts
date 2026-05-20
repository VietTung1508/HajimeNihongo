export interface GrammarExample {
  id: number
  sentence: string
  translation: string
  audioUrl?: string
}

export interface GrammarListItem {
  id: number
  grammarPoint: string
  meaning: string
  level: string
  lessonNumber?: number
  examplesCount: number
}

export interface GrammarListResponse {
  data: GrammarListItem[]
  total: number
  page: number
  limit: number
}

export interface GrammarDetail {
  id: number
  grammarPoint: string
  meaning: string
  level: string
  lessonNumber?: number
  lessonTitle?: string
  structure?: string
  structureDisplay?: string
  partOfSpeech?: string
  register?: string
  about?: string
  exampleJp?: string
  exampleEn?: string
  synonyms?: string
  antonyms?: string
  meaningHint?: string
  examples: GrammarExample[]
}

export interface GrammarFilters {
  q?: string
  level?: string
  page?: number
  limit?: number
}

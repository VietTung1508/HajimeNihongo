export interface GrammarExample {
  id: number
  sentence: string
  translation: string
  audioUrl: string | null
}

export interface GrammarItem {
  id: number
  grammarPoint: string
  meaning: string
  level: string
  lessonNumber: number | null
  lessonTitle: string | null
  structure: string | null
  structureDisplay: string | null
}

export interface GrammarDetail extends GrammarItem {
  partOfSpeech: string | null
  register: string | null
  about: string | null
  exampleJp: string | null
  exampleEn: string | null
  synonyms: string | null
  antonyms: string | null
  meaningHint: string | null
  examples: GrammarExample[]
}

export interface GrammarListResponse {
  data: GrammarItem[]
  total: number
}

export interface GrammarSearchResponse {
  data: GrammarItem[]
  total: number
}

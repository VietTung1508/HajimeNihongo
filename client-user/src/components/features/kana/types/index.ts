export interface KanaSection {
  id: number
  type: 'hiragana' | 'katakana'
  title: string
  content: string
  order: number
}

export interface KanaSectionsResponse {
  hiragana: KanaSection[]
  katakana: KanaSection[]
}

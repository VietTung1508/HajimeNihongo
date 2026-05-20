export type KanaSectionType = 'hiragana' | 'katakana'

export interface KanaSection {
  id: number
  type: KanaSectionType
  title: string
  content: string // HTML string rendered via dangerouslySetInnerHTML in client-user
  order: number
}

export interface KanaListResponse {
  hiragana: KanaSection[]
  katakana: KanaSection[]
}

export interface CreateKanaPayload {
  type: KanaSectionType
  title: string
  content: string
  order: number
}

export type UpdateKanaPayload = Partial<CreateKanaPayload>

export interface ReorderKanaPayload {
  sections: { id: number; order: number }[]
}

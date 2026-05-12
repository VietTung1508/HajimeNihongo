/**
 * Review feature types
 * Types for review queue API responses and review items
 */

/**
 * A review item can be either a word or grammar point
 * Uses discriminant union with 'type' field
 */
export interface ReviewItem {
  id: number
  type: 'word' | 'grammar'

  // Word-specific fields (present when type === 'word')
  kanji?: string | null
  reading?: string
  meanings?: string[]
  jlptLevel?: number | null
  isCommon?: boolean

  // Grammar-specific fields (present when type === 'grammar')
  grammarPoint?: string
  meaning?: string
  exampleJp?: string
  exampleEn?: string
}

/**
 * Response from GET /api/review/items
 * Returns paginated list of review items
 */
export interface ReviewItemsResponse {
  items: ReviewItem[]
  total: number
  counts?: {
    word: number
    grammar: number
  }
}

/**
 * Response from GET /api/review/ids
 * Returns list of IDs in user's review queue
 */
export interface QueueIdsResponse {
  ids: number[]
}

/**
 * Response from POST /api/review/add and DELETE /api/review/remove
 * Returns counts of added, removed, and skipped items
 */
export interface QueueMutationResponse {
  added: number
  removed: number
  skipped: number
}

/**
 * Type guard to check if a review item is a word
 */
export function isWordReviewItem(item: ReviewItem): item is ReviewItem & {
  type: 'word'
  kanji: string | null
  reading: string
  meanings: string[]
  jlptLevel: number | null
  isCommon: boolean
} {
  return item.type === 'word'
}

/**
 * Type guard to check if a review item is a grammar point
 */
export function isGrammarReviewItem(item: ReviewItem): item is ReviewItem & {
  type: 'grammar'
  grammarPoint: string
  meaning: string
  exampleJp: string
  exampleEn: string
} {
  return item.type === 'grammar'
}

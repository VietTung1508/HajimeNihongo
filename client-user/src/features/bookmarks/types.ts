import {WordDTO} from '@/components/features/words/types'
import {GrammarItem} from '@/components/features/grammar/types'

export interface BookmarkResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface BookmarkItem {
  id: number
  bookmarkedAt: string
}

export interface BookmarkMutationResponse {
  added: number
  removed: number
  skipped: number
}

export interface BookmarkedIdsResponse {
  ids: number[]
}

export interface WordBookmarkDTO extends WordDTO, BookmarkItem {
  entSeq?: number
  audioUrl?: string
  meanings: string[]
}

export interface GrammarBookmarkDTO extends GrammarItem, BookmarkItem {}

export type SortOption = 'newest' | 'oldest' | 'level'

export interface BookmarksFilters {
  searchQuery: string
  sort: SortOption
  vocabPage: number
  grammarPage: number
  isSelectionMode: boolean
  selectedVocabIds: Set<number>
  selectedGrammarIds: Set<number>
}

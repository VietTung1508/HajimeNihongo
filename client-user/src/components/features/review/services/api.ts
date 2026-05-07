import { apiClient } from '@/lib/api/apiClient'
import {
  ReviewItemsResponse,
  QueueIdsResponse,
  QueueMutationResponse,
} from '../types'

export const reviewApi = {
  /**
   * Get review items from the queue
   * GET /review-queue/items
   */
  getReviewItems: async (): Promise<ReviewItemsResponse> => {
    const response = await apiClient.get<ReviewItemsResponse>('/review-queue/items')
    return response.data
  },

  /**
   * Add words to review queue
   * POST /review-queue/word
   */
  addWordToQueue: async (ids: number[]): Promise<QueueMutationResponse> => {
    const response = await apiClient.post<QueueMutationResponse>('/review-queue/word', {ids})
    return response.data
  },

  /**
   * Add grammar points to review queue
   * POST /review-queue/grammar
   */
  addGrammarToQueue: async (ids: number[]): Promise<QueueMutationResponse> => {
    const response = await apiClient.post<QueueMutationResponse>('/review-queue/grammar', {
      ids,
    })
    return response.data
  },

  /**
   * Remove words from review queue
   * DELETE /review-queue/word
   */
  removeWordFromQueue: async (ids: number[]): Promise<QueueMutationResponse> => {
    const response = await apiClient.delete<QueueMutationResponse>('/review-queue/word', {
      data: {ids},
    })
    return response.data
  },

  /**
   * Remove grammar points from review queue
   * DELETE /review-queue/grammar
   */
  removeGrammarFromQueue: async (ids: number[]): Promise<QueueMutationResponse> => {
    const response = await apiClient.delete<QueueMutationResponse>('/review-queue/grammar', {
      data: {ids},
    })
    return response.data
  },

  /**
   * Get queued IDs by type
   * GET /review-queue/ids?type=word|grammar
   */
  getQueuedIds: async (type: 'word' | 'grammar'): Promise<QueueIdsResponse> => {
    const response = await apiClient.get<QueueIdsResponse>('/review-queue/ids', {
      params: {type},
    })
    return response.data
  },

  /**
   * Mark words as mastered
   * POST /review-queue/word/mastered
   */
  markWordAsMastered: async (ids: number[]): Promise<{marked: number; removed: number}> => {
    const response = await apiClient.post<{marked: number; removed: number}>('/review-queue/word/mastered', {ids})
    return response.data
  },

  /**
   * Mark grammar points as mastered
   * POST /review-queue/grammar/mastered
   */
  markGrammarAsMastered: async (ids: number[]): Promise<{marked: number; removed: number}> => {
    const response = await apiClient.post<{marked: number; removed: number}>('/review-queue/grammar/mastered', {ids})
    return response.data
  },

  /**
   * Get mastered IDs by type
   * GET /review-queue/mastered?type=word|grammar
   */
  getMasteredIds: async (type: 'word' | 'grammar'): Promise<QueueIdsResponse> => {
    const response = await apiClient.get<QueueIdsResponse>('/review-queue/mastered', {
      params: {type},
    })
    return response.data
  },

  /**
   * Unmark words as mastered
   * DELETE /review-queue/word/mastered
   */
  unmarkWordAsMastered: async (ids: number[]): Promise<{unmarked: number}> => {
    const response = await apiClient.delete<{unmarked: number}>('/review-queue/word/mastered', {
      data: {ids},
    })
    return response.data
  },

  /**
   * Unmark grammar points as mastered
   * DELETE /review-queue/grammar/mastered
   */
  unmarkGrammarAsMastered: async (ids: number[]): Promise<{unmarked: number}> => {
    const response = await apiClient.delete<{unmarked: number}>('/review-queue/grammar/mastered', {
      data: {ids},
    })
    return response.data
  },
}

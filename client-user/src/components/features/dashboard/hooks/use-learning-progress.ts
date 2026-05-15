'use client'

import {useQuery} from '@tanstack/react-query'
import {apiClient} from '@/lib/api/apiClient'

interface LearnProgress {
  completed: number
  total: number
}

interface LearnProgressItem {
  viewedAt: string | null
}

export function useLearningProgress() {
  return useQuery<LearnProgress>({
    queryKey: ['learn-progress'],
    queryFn: async () => {
      const response = await apiClient.get('/learn/today')
      const items: LearnProgressItem[] = response.data.items || []
      return {
        completed: items.filter((item) => item.viewedAt).length,
        total: items.length
      }
    },
    staleTime: 5 * 60 * 1000
  })
}

interface ReviewQueueData {
  total: number
  counts: {
    word: number
    grammar: number
  }
}

export function useReviewQueue() {
  return useQuery<ReviewQueueData>({
    queryKey: ['review-queue-summary'],
    queryFn: async () => {
      const response = await apiClient.get('/review-queue/items')
      const data = response.data

      // Defensive checks to ensure correct data types
      const total = typeof data?.total === 'number' ? data.total : 0
      const counts = data?.counts && typeof data.counts === 'object' ? data.counts : {word: 0, grammar: 0}
      const wordCount = typeof counts.word === 'number' ? counts.word : 0
      const grammarCount = typeof counts.grammar === 'number' ? counts.grammar : 0

      return {
        total,
        counts: {
          word: wordCount,
          grammar: grammarCount
        }
      }
    },
    staleTime: 5 * 60 * 1000
  })
}

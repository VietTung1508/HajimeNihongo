'use client'

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {reviewApi} from '../services/api'
import {toast} from 'sonner'

/**
 * Review Queue Hooks
 * Custom hooks for managing review queue operations using TanStack Query
 */

/**
 * Record a review attempt (correct/incorrect)
 * This creates a review_history record which powers:
 * - Learning Activity chart
 * - Weak Areas analysis
 */
export function useRecordReviewAttempt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({wordId, grammarId, isCorrect}: {
      wordId: number | null
      grammarId: number | null
      isCorrect: boolean
    }) => reviewApi.recordReviewAttempt(wordId, grammarId, isCorrect),
    onSuccess: () => {
      // Invalidate dashboard queries that depend on review history
      queryClient.invalidateQueries({queryKey: ['dashboard-activity']})
      queryClient.invalidateQueries({queryKey: ['dashboard-weak-areas']})
    },
  })
}


/**
 * Fetch review items from the queue
 * @param type - Optional filter by type ('word', 'grammar', or undefined for all)
 * @returns React Query result with review items data
 */
export function useReviewItems(type?: 'word' | 'grammar') {
  return useQuery({
    queryKey: ['review-items', type],
    queryFn: () => reviewApi.getReviewItems(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch queued IDs by type (word or grammar)
 * Used for determining button states (add/remove from queue)
 * @param type - 'word' or 'grammar'
 * @returns React Query result with queued IDs array
 */
export function useQueuedIds(type: 'word' | 'grammar') {
  return useQuery({
    queryKey: ['queued-ids', type],
    queryFn: () => reviewApi.getQueuedIds(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch mastered IDs by type (word or grammar)
 * Used for showing mastered status in word/grammar lists
 * @param type - 'word' or 'grammar'
 * @returns React Query result with mastered IDs array
 */
export function useMasteredIds(type: 'word' | 'grammar') {
  return useQuery({
    queryKey: ['mastered-ids', type],
    queryFn: () => reviewApi.getMasteredIds(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Add items to review queue
 * Supports both words and grammar points
 * @returns Mutation object with mutate, mutateAsync, isLoading
 */
export function useAddToQueue() {
  const queryClient = useQueryClient()

  const addWordMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.addWordToQueue(ids),
    onSuccess: (data) => {
      if (data.added > 0) {
        toast.success(`Added ${data.added} words to review queue`)
      }
      if (data.skipped > 0) {
        toast.info(`${data.skipped} words already in queue`)
      }
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'word']})
      queryClient.invalidateQueries({queryKey: ['review-items']})
      queryClient.invalidateQueries({queryKey: ['review-queue-summary']})
    },
    onError: () => {
      toast.error('Failed to add words to review queue')
    },
  })

  const addGrammarMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.addGrammarToQueue(ids),
    onSuccess: (data) => {
      if (data.added > 0) {
        toast.success(`Added ${data.added} grammar points to review queue`)
      }
      if (data.skipped > 0) {
        toast.info(`${data.skipped} grammar points already in queue`)
      }
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'grammar']})
      queryClient.invalidateQueries({queryKey: ['review-items']})
      queryClient.invalidateQueries({queryKey: ['review-queue-summary']})
    },
    onError: () => {
      toast.error('Failed to add grammar points to review queue')
    },
  })

  return {
    addWord: addWordMutation.mutate,
    addWordAsync: addWordMutation.mutateAsync,
    isAddingWord: addWordMutation.isPending,
    addGrammar: addGrammarMutation.mutate,
    addGrammarAsync: addGrammarMutation.mutateAsync,
    isAddingGrammar: addGrammarMutation.isPending,
  }
}

/**
 * Remove items from review queue
 * Supports both words and grammar points
 * @returns Mutation object with mutate, mutateAsync, isLoading
 */
export function useRemoveFromQueue() {
  const queryClient = useQueryClient()

  const removeWordMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.removeWordFromQueue(ids),
    onSuccess: (data) => {
      if (data.removed > 0) {
        toast.success(`Removed ${data.removed} words from review queue`)
      }
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'word']})
      queryClient.invalidateQueries({queryKey: ['review-items']})
      queryClient.invalidateQueries({queryKey: ['review-queue-summary']})
    },
    onError: () => {
      toast.error('Failed to remove words from review queue')
    },
  })

  const removeGrammarMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.removeGrammarFromQueue(ids),
    onSuccess: (data) => {
      if (data.removed > 0) {
        toast.success(`Removed ${data.removed} grammar points from review queue`)
      }
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'grammar']})
      queryClient.invalidateQueries({queryKey: ['review-items']})
      queryClient.invalidateQueries({queryKey: ['review-queue-summary']})
    },
    onError: () => {
      toast.error('Failed to remove grammar points from review queue')
    },
  })

  return {
    removeWord: removeWordMutation.mutate,
    removeWordAsync: removeWordMutation.mutateAsync,
    isRemovingWord: removeWordMutation.isPending,
    removeGrammar: removeGrammarMutation.mutate,
    removeGrammarAsync: removeGrammarMutation.mutateAsync,
    isRemovingGrammar: removeGrammarMutation.isPending,
  }
}

/**
 * Mark items as mastered and remove from queue
 * Supports both words and grammar points
 * @returns Mutation object with mutate, mutateAsync, isLoading
 */
export function useMarkAsMastered() {
  const queryClient = useQueryClient()

  const markWordMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.markWordAsMastered(ids),
    onSuccess: (data) => {
      if (data.marked > 0) {
        toast.success(`Mastered ${data.marked} words!`)
      }
      queryClient.invalidateQueries({queryKey: ['mastered-ids', 'word']})
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'word']})
      queryClient.invalidateQueries({queryKey: ['review-items']})
      queryClient.invalidateQueries({queryKey: ['review-queue-summary']})
      queryClient.invalidateQueries({queryKey: ['learn-today']})
      queryClient.invalidateQueries({queryKey: ['learn-streak']})
      queryClient.invalidateQueries({queryKey: ['dashboard-activity']})
      queryClient.invalidateQueries({queryKey: ['dashboard-weak-areas']})
      queryClient.invalidateQueries({queryKey: ['dashboard-stats']})
      queryClient.invalidateQueries({queryKey: ['unlocked-levels']})
      queryClient.invalidateQueries({queryKey: ['words']})
      queryClient.invalidateQueries({queryKey: ['grammar-list']})
    },
    onError: () => {
      toast.error('Failed to mark words as mastered')
    },
  })

  const markGrammarMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.markGrammarAsMastered(ids),
    onSuccess: (data) => {
      if (data.marked > 0) {
        toast.success(`Mastered ${data.marked} grammar points!`)
      }
      queryClient.invalidateQueries({queryKey: ['mastered-ids', 'grammar']})
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'grammar']})
      queryClient.invalidateQueries({queryKey: ['review-items']})
      queryClient.invalidateQueries({queryKey: ['review-queue-summary']})
      queryClient.invalidateQueries({queryKey: ['learn-today']})
      queryClient.invalidateQueries({queryKey: ['learn-streak']})
      queryClient.invalidateQueries({queryKey: ['dashboard-activity']})
      queryClient.invalidateQueries({queryKey: ['dashboard-weak-areas']})
      queryClient.invalidateQueries({queryKey: ['dashboard-stats']})
      queryClient.invalidateQueries({queryKey: ['unlocked-levels']})
      queryClient.invalidateQueries({queryKey: ['words']})
      queryClient.invalidateQueries({queryKey: ['grammar-list']})
    },
    onError: () => {
      toast.error('Failed to mark grammar as mastered')
    },
  })

  const unmarkWordMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.unmarkWordAsMastered(ids),
    onSuccess: (data) => {
      if (data.unmarked > 0) {
        toast.success(`Unmastered ${data.unmarked} words`)
      }
      queryClient.invalidateQueries({queryKey: ['mastered-ids', 'word']})
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'word']})
      queryClient.invalidateQueries({queryKey: ['dashboard-stats']})
      queryClient.invalidateQueries({queryKey: ['unlocked-levels']})
      queryClient.invalidateQueries({queryKey: ['words']})
      queryClient.invalidateQueries({queryKey: ['grammar-list']})
    },
    onError: () => {
      toast.error('Failed to unmark words as mastered')
    },
  })

  const unmarkGrammarMutation = useMutation({
    mutationFn: (ids: number[]) => reviewApi.unmarkGrammarAsMastered(ids),
    onSuccess: (data) => {
      if (data.unmarked > 0) {
        toast.success(`Unmastered ${data.unmarked} grammar points`)
      }
      queryClient.invalidateQueries({queryKey: ['mastered-ids', 'grammar']})
      queryClient.invalidateQueries({queryKey: ['queued-ids', 'grammar']})
      queryClient.invalidateQueries({queryKey: ['dashboard-stats']})
      queryClient.invalidateQueries({queryKey: ['unlocked-levels']})
      queryClient.invalidateQueries({queryKey: ['words']})
      queryClient.invalidateQueries({queryKey: ['grammar-list']})
    },
    onError: () => {
      toast.error('Failed to unmark grammar as mastered')
    },
  })

  return {
    markWord: markWordMutation.mutate,
    markWordAsync: markWordMutation.mutateAsync,
    isMarkingWord: markWordMutation.isPending,
    markGrammar: markGrammarMutation.mutate,
    markGrammarAsync: markGrammarMutation.mutateAsync,
    isMarkingGrammar: markGrammarMutation.isPending,
    unmarkWord: unmarkWordMutation.mutate,
    unmarkWordAsync: unmarkWordMutation.mutateAsync,
    isUnmarkingWord: unmarkWordMutation.isPending,
    unmarkGrammar: unmarkGrammarMutation.mutate,
    unmarkGrammarAsync: unmarkGrammarMutation.mutateAsync,
    isUnmarkingGrammar: unmarkGrammarMutation.isPending,
  }
}

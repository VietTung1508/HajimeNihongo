'use client'

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {learnApi} from '../services/api'
import {toast} from 'sonner'

export function useTodayLearn() {
  return useQuery({
    queryKey: ['learn-today'],
    queryFn: () => learnApi.getTodayLearn(),
    staleTime: 30 * 1000, // 30 seconds - shorter to get fresh status after reviews
  })
}

export function useMarkItemAsViewed() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (itemId: number) => learnApi.markItemAsViewed(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['learn-today']})
    },
    onError: () => {
      toast.error('Failed to mark item as viewed')
    },
  })

  return {
    markItemAsViewed: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export function useItemStatus(itemId: number) {
  return useQuery({
    queryKey: ['learn-item-status', itemId],
    queryFn: () => learnApi.checkItemStatus(itemId),
    enabled: !!itemId,
    staleTime: 10000,
  })
}

export function usePushToReview() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => learnApi.pushToReview(),
    onSuccess: (data) => {
      if (data.pushed > 0) {
        toast.success(`${data.pushed} items pushed to review queue!`)
      } else {
        toast.info(data.message || 'No new items to push')
      }
      queryClient.invalidateQueries({queryKey: ['learn-today']})
      queryClient.invalidateQueries({queryKey: ['review-items']})
    },
    onError: () => {
      toast.error('Failed to push items to review')
    },
  })

  return {
    pushToReview: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export function useStreak() {
  return useQuery({
    queryKey: ['learn-streak'],
    queryFn: () => learnApi.getStreak(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useGenerateDailyLearn() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => learnApi.generateDailyLearn(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({queryKey: ['learn-today'], refetchType: 'active'})
      await queryClient.refetchQueries({queryKey: ['learn-today']})

      if (data.items && data.items.length > 0) {
        toast.success(`Generated ${data.items.length} learning items for today!`)
      } else {
        toast.info(data.message || 'No items generated')
      }
    },
    onError: (error: any) => {
      console.error('Generate daily learn error:', error)
      const message = error?.response?.data?.error || error?.message || 'Failed to generate daily learn'
      toast.error(message)
    },
  })

  return {
    generateDailyLearn: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export function useGenerateExtraBatch() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => learnApi.generateExtraBatch(),
    onSuccess: async (data) => {
      // Force immediate refetch
      await queryClient.invalidateQueries({queryKey: ['learn-today'], refetchType: 'active'})
      await queryClient.refetchQueries({queryKey: ['learn-today']})

      if (data.items && data.items.length > 0) {
        toast.success(`Generated ${data.items.length} extra learning items! Weekend warrior mode activated! 💪`)
      } else {
        toast.info(data.message || 'No items generated - you may have mastered all available items at your current level!')
      }
    },
    onError: (error: any) => {
      console.error('Generate extra batch error:', error)
      const message = error?.response?.data?.error || error?.message || 'Failed to generate extra batch'
      toast.error(message)
    },
  })

  return {
    generateExtraBatch: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

'use client'

import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {chatApi} from '../services/api'
import {ChatSession} from '../types'

export const useChatSessions = () => {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: ['chat-sessions'],
    queryFn: ({pageParam}: {pageParam: string | undefined}) =>
      chatApi.getSessions(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  })

  const sessions: ChatSession[] =
    query.data?.pages.flatMap((p) => p.sessions) ?? []

  const createMutation = useMutation({
    mutationFn: chatApi.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['chat-sessions']})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['chat-sessions']})
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.toggleFavorite(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['chat-sessions']})
    },
  })

  return {
    sessions,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    createSession: createMutation.mutate,
    createSessionAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    toggleFavorite: toggleFavoriteMutation.mutate,
  }
}

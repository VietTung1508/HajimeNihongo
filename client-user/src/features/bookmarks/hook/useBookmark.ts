'use client'

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import api from '@/lib/apiClient'
import {toast} from 'sonner'
import type {
  BookmarkResponse,
  BookmarkedIdsResponse,
  BookmarkMutationResponse,
} from '../types'

interface UseBookmarkOptions {
  type: 'word' | 'grammar'
}

export function useBookmark({type}: UseBookmarkOptions) {
  const queryClient = useQueryClient()

  const useGetBookmarks = (
    page: number,
    limit: number,
    search?: string,
    sort?: string,
  ) => {
    return useQuery({
      queryKey: ['bookmarks', type, page, limit, search, sort],
      queryFn: async () => {
        const {data} = await api.get<BookmarkResponse<any>>(
          `/bookmarks/${type}`,
          {
            params: {page, limit, search, sort},
          },
        )
        return data
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  const useGetBookmarkedIds = () => {
    return useQuery({
      queryKey: ['bookmarks', 'ids', type],
      queryFn: async () => {
        const {data} = await api.get<BookmarkedIdsResponse>(`/bookmarks/ids`, {
          params: {type},
        })
        return data.ids
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  const toggleBookmark = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: number
      action: 'add' | 'remove'
    }) => {
      const ids = [id]
      if (action === 'add') {
        const {data} = await api.post<BookmarkMutationResponse>(
          `/bookmarks/${type}`,
          {ids},
        )
        return data
      } else {
        const {data} = await api.delete<BookmarkMutationResponse>(
          `/bookmarks/${type}`,
          {data: {ids}},
        )
        return data
      }
    },
    onMutate: async ({id, action}) => {
      await queryClient.cancelQueries({queryKey: ['bookmarks', 'ids', type]})
      const previousIds = queryClient.getQueryData<number[]>([
        'bookmarks',
        'ids',
        type,
      ])

      queryClient.setQueryData<number[]>(
        ['bookmarks', 'ids', type],
        (old = []) => {
          if (action === 'add') {
            return old.includes(id) ? old : [...old, id]
          } else {
            return old.filter((x) => x !== id)
          }
        },
      )

      return {previousIds}
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['bookmarks', 'ids', type], context?.previousIds)
      toast.error('Failed to update bookmark')
    },
    onSuccess: (_, variables) => {
      const msg =
        variables.action === 'add'
          ? 'Added to bookmarks'
          : 'Removed from bookmarks'
      toast.success(msg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['bookmarks']})
    },
  })

  const bulkRemoveBookmarks = useMutation({
    mutationFn: async (ids: number[]) => {
      const {data} = await api.delete<BookmarkMutationResponse>(
        `/bookmarks/${type}`,
        {
          data: {ids},
        },
      )
      return data
    },
    onSuccess: (data) => {
      toast.success(`Removed ${data.removed} bookmarks`)
      queryClient.invalidateQueries({queryKey: ['bookmarks']})
    },
    onError: () => {
      toast.error('Failed to remove bookmarks')
    },
  })

  return {
    useGetBookmarks,
    useGetBookmarkedIds,
    toggleBookmark,
    bulkRemoveBookmarks,
  }
}

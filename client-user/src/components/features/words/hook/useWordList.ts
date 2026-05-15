'use client'

import {useQuery, keepPreviousData} from '@tanstack/react-query'
import {wordsApi} from '../services/api'

export const useWordList = (
  q: string,
  sort: string,
  level: string,
  page: number,
  commonOnly: boolean,
  limit = 12,
) => {
  const result = useQuery({
    queryKey: ['words', {q, sort, level, page, commonOnly, limit}],
    queryFn: () => wordsApi.getWordList({q, sort, level, page, commonOnly, limit}),
    staleTime: 0,
    refetchOnMount: 'always',
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  return {
    ...result,
    isSearching: result.isFetching && !result.isLoading,
  }
}

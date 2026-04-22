'use client'

import {useQuery, keepPreviousData} from '@tanstack/react-query'
import {wordsApi} from '../services/api'

export const useWordList = (
  q: string,
  sort: string,
  page: number,
  commonOnly: boolean,
  limit = 12,
) => {
  const result = useQuery({
    queryKey: ['words', {q, sort, page, commonOnly, limit}],
    queryFn: () => wordsApi.getWordList({q, sort, page, commonOnly, limit}),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  return {
    ...result,
    isSearching: result.isFetching && !result.isLoading,
  }
}

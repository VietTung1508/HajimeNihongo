'use client'

import {useQuery} from '@tanstack/react-query'
import {grammarApi} from '../services/api'

export const useGrammarSearch = (q: string) => {
  return useQuery({
    queryKey: ['grammar-search', q],
    queryFn: () => grammarApi.searchGrammar(q),
    enabled: q.trim().length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
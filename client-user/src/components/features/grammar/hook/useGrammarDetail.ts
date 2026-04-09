'use client'

import {useQuery} from '@tanstack/react-query'
import {grammarApi} from '../services/api'

export const useGrammarDetail = (id: number) => {
  return useQuery({
    queryKey: ['grammar-detail', id],
    queryFn: () => grammarApi.getGrammarDetail(id),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
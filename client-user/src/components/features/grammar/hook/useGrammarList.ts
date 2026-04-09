'use client'

import {useQuery} from '@tanstack/react-query'
import {grammarApi} from '../services/api'

export const useGrammarList = (level?: string, lesson?: string) => {
  return useQuery({
    queryKey: ['grammar-list', level, lesson],
    queryFn: () => grammarApi.getGrammarList(level, lesson),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
'use client'

import {useQuery} from '@tanstack/react-query'
import {kanaApi} from '../services/api'

export const useKanaSections = () => {
  return useQuery({
    queryKey: ['kana-sections'],
    queryFn: () => kanaApi.getKanaSections(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

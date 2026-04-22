'use client'

import {useQuery} from '@tanstack/react-query'
import {wordsApi} from '../services/api'

export const useWordDetail = (id: string) => {
  return useQuery({
    queryKey: ['word', id],
    queryFn: () => wordsApi.getWordDetail(Number(id)),
    enabled: !!id,
  })
}

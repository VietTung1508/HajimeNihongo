import { useQuery } from '@tanstack/react-query'
import { adminVocabularyApi } from '@/lib/api/admin-vocabulary-api'
import type { VocabFilters } from '@/types/vocabulary'

export function useVocabulary(filters?: VocabFilters) {
  return useQuery({
    queryKey: ['admin-vocabulary', filters],
    queryFn: () => adminVocabularyApi.list(filters),
  })
}

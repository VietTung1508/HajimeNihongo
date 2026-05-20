import { useQuery } from '@tanstack/react-query'
import { adminVocabularyApi } from '@/lib/api/admin-vocabulary-api'

export function useVocabularyDetail(id: number | null) {
  return useQuery({
    queryKey: ['admin-vocabulary-detail', id],
    queryFn: () => adminVocabularyApi.getById(id!),
    enabled: id !== null,
  })
}

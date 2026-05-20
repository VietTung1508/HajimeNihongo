import { useQuery } from '@tanstack/react-query'
import { adminGrammarApi } from '@/lib/api/admin-grammar-api'

export function useGrammarDetail(id: number | null) {
  return useQuery({
    queryKey: ['admin-grammar-detail', id],
    queryFn: () => adminGrammarApi.getById(id!),
    enabled: id !== null,
  })
}

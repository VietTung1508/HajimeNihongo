import { useQuery } from '@tanstack/react-query'
import { adminGrammarApi } from '@/lib/api/admin-grammar-api'
import type { GrammarFilters } from '@/types/grammar'

export function useGrammar(filters?: GrammarFilters) {
  return useQuery({
    queryKey: ['admin-grammar', filters],
    queryFn: () => adminGrammarApi.list(filters),
  })
}

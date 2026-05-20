import { useQuery } from '@tanstack/react-query'
import { adminKanaApi } from '@/lib/api/admin-kana-api'

export function useKanaDetail(id: number) {
  return useQuery({
    queryKey: ['admin-kana', id],
    queryFn: () => adminKanaApi.getById(id),
    enabled: id > 0,
  })
}

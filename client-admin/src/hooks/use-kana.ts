import { useQuery } from '@tanstack/react-query'
import { adminKanaApi } from '@/lib/api/admin-kana-api'

export function useKana() {
  return useQuery({
    queryKey: ['admin-kana'],
    queryFn: () => adminKanaApi.list(),
  })
}

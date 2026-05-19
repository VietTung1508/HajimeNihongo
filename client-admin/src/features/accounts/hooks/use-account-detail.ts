import { useQuery } from '@tanstack/react-query'
import { adminAccountsApi } from '@/lib/api/admin-accounts-api'
import type { AccountDetail } from '@/types/account'

export function useAccountDetail(id: string) {
  return useQuery<AccountDetail>({
    queryKey: ['admin-account', id],
    queryFn: () => adminAccountsApi.getById(id),
  })
}

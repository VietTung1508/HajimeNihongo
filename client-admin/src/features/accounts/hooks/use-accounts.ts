import { useQuery } from '@tanstack/react-query'
import { adminAccountsApi } from '@/lib/api/admin-accounts-api'
import type { AccountFilters, AccountListResponse } from '@/types/account'

export function useAccounts(filters: AccountFilters) {
  return useQuery<AccountListResponse>({
    queryKey: ['admin-accounts', filters],
    queryFn: () => adminAccountsApi.list(filters),
  })
}

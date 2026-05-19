import apiClient from './apiClient'
import type { AccountListResponse, AccountDetail, AccountFilters } from '@/types/account'

export const adminAccountsApi = {
  list: async (filters: AccountFilters = {}): Promise<AccountListResponse> => {
    const params: Record<string, unknown> = { limit: 20 }
    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit
    if (filters.search) params.search = filters.search
    if (filters.level) params.level = filters.level
    if (filters.studyPace) params.studyPace = filters.studyPace

    const res = await apiClient.get<AccountListResponse>('/admin/accounts', { params })
    return res.data
  },

  getById: async (id: string): Promise<AccountDetail> => {
    const res = await apiClient.get<AccountDetail>(`/admin/accounts/${id}`)
    return res.data
  },
}

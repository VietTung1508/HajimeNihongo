import apiClient from './apiClient'
import type { PermissionGroup } from '@/types/rbac'

export const permissionsApi = {
  list: async (): Promise<PermissionGroup[]> => {
    const res = await apiClient.get<PermissionGroup[]>('/admin/permissions')
    return res.data
  },
}

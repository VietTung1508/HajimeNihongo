import apiClient from './apiClient'
import type { RoleListItem, RoleDetail } from '@/types/rbac'

interface CreateRolePayload { name: string; permissionIds: string[] }
interface UpdateRolePayload { name?: string; permissionIds?: string[] }
interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number }

export const rolesApi = {
  list: async (): Promise<RoleListItem[]> => {
    const res = await apiClient.get<PaginatedResponse<RoleListItem>>('/admin/roles', { params: { limit: 1000 } })
    return res.data.data
  },
  getById: async (id: string): Promise<RoleDetail> => {
    const res = await apiClient.get<RoleDetail>(`/admin/roles/${id}`)
    return res.data
  },
  create: async (payload: CreateRolePayload): Promise<RoleListItem> => {
    const res = await apiClient.post<RoleListItem>('/admin/roles', payload)
    return res.data
  },
  update: async (id: string, payload: UpdateRolePayload): Promise<RoleListItem> => {
    const res = await apiClient.patch<RoleListItem>(`/admin/roles/${id}`, payload)
    return res.data
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/roles/${id}`)
  },
}

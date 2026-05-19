import apiClient from './apiClient'
import type { AdminUserListItem } from '@/types/rbac'

interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number }

export const adminUsersApi = {
  list: async (): Promise<AdminUserListItem[]> => {
    const res = await apiClient.get<PaginatedResponse<AdminUserListItem>>('/admin/users', { params: { limit: 1000 } })
    return res.data.data
  },
  create: async (payload: {
    email: string; username: string; password: string; roleIds?: string[];
    gender?: string; dateOfBirth?: string
  }): Promise<AdminUserListItem> => {
    const res = await apiClient.post<AdminUserListItem>('/admin/users', payload)
    return res.data
  },
  update: async (id: string, payload: {
    username?: string; roleIds?: string[]; gender?: string; dateOfBirth?: string
  }): Promise<AdminUserListItem> => {
    const res = await apiClient.patch<AdminUserListItem>(`/admin/users/${id}`, payload)
    return res.data
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`)
  },
}

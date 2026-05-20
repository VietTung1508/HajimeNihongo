import apiClient from './apiClient'
import type {
  KanaSection, KanaListResponse,
  CreateKanaPayload, UpdateKanaPayload, ReorderKanaPayload,
} from '@/types/kana'

export const adminKanaApi = {
  list: async (): Promise<KanaListResponse> => {
    const res = await apiClient.get<KanaListResponse>('/admin/kana')
    return res.data
  },

  getById: async (id: number): Promise<KanaSection> => {
    const res = await apiClient.get<KanaSection>(`/admin/kana/${id}`)
    return res.data
  },

  create: async (payload: CreateKanaPayload): Promise<KanaSection> => {
    const res = await apiClient.post<KanaSection>('/admin/kana', payload)
    return res.data
  },

  update: async (id: number, payload: UpdateKanaPayload): Promise<KanaSection> => {
    const res = await apiClient.patch<KanaSection>(`/admin/kana/${id}`, payload)
    return res.data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/kana/${id}`)
  },

  reorder: async (payload: ReorderKanaPayload): Promise<void> => {
    await apiClient.patch('/admin/kana/reorder', payload)
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiClient.post<{ url: string }>('/admin/kana/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.url
  },
}

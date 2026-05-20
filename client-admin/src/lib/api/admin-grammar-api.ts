import apiClient from './apiClient'
import type {
  GrammarListResponse, GrammarDetail,
  GrammarExample, GrammarFilters,
} from '@/types/grammar'

export const adminGrammarApi = {
  list: async (filters?: GrammarFilters): Promise<GrammarListResponse> => {
    const res = await apiClient.get<GrammarListResponse>('/admin/grammar', { params: filters })
    return res.data
  },

  getById: async (id: number): Promise<GrammarDetail> => {
    const res = await apiClient.get<GrammarDetail>(`/admin/grammar/${id}`)
    return res.data
  },

  create: async (payload: Pick<GrammarDetail, 'grammarPoint' | 'meaning' | 'level'> & Partial<Omit<GrammarDetail, 'id' | 'examples'>>): Promise<GrammarDetail> => {
    const res = await apiClient.post<GrammarDetail>('/admin/grammar', payload)
    return res.data
  },

  update: async (id: number, payload: Partial<Omit<GrammarDetail, 'id' | 'examples'>>): Promise<GrammarDetail> => {
    const res = await apiClient.patch<GrammarDetail>(`/admin/grammar/${id}`, payload)
    return res.data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/grammar/${id}`)
  },

  addExample: async (grammarId: number, payload: Omit<GrammarExample, 'id'>): Promise<GrammarExample> => {
    const res = await apiClient.post<GrammarExample>(`/admin/grammar/${grammarId}/examples`, payload)
    return res.data
  },

  updateExample: async (grammarId: number, exampleId: number, payload: Partial<Omit<GrammarExample, 'id'>>): Promise<GrammarExample> => {
    const res = await apiClient.patch<GrammarExample>(`/admin/grammar/${grammarId}/examples/${exampleId}`, payload)
    return res.data
  },

  deleteExample: async (grammarId: number, exampleId: number): Promise<void> => {
    await apiClient.delete(`/admin/grammar/${grammarId}/examples/${exampleId}`)
  },
}

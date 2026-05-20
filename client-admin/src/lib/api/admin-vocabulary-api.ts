import apiClient from './apiClient'
import type {
  VocabListItem, VocabListResponse, VocabDetail,
  VocabMeaning, VocabExample, VocabFilters, CreateWordPayload,
} from '@/types/vocabulary'

export const adminVocabularyApi = {
  create: async (payload: CreateWordPayload): Promise<VocabDetail> => {
    const res = await apiClient.post<VocabDetail>('/admin/vocabulary', payload)
    return res.data
  },

  list: async (filters?: VocabFilters): Promise<VocabListResponse> => {
    const res = await apiClient.get<VocabListResponse>('/admin/vocabulary', { params: filters })
    return res.data
  },

  getById: async (id: number): Promise<VocabDetail> => {
    const res = await apiClient.get<VocabDetail>(`/admin/vocabulary/${id}`)
    return res.data
  },

  update: async (id: number, payload: Partial<Pick<VocabDetail, 'jlptLevel' | 'isCommon' | 'audioUrl'>>): Promise<VocabDetail> => {
    const res = await apiClient.patch<VocabDetail>(`/admin/vocabulary/${id}`, payload)
    return res.data
  },

  addMeaning: async (wordId: number, text: string): Promise<VocabMeaning> => {
    const res = await apiClient.post<VocabMeaning>(`/admin/vocabulary/${wordId}/meanings`, { text })
    return res.data
  },

  updateMeaning: async (wordId: number, meaningId: number, text: string): Promise<VocabMeaning> => {
    const res = await apiClient.patch<VocabMeaning>(`/admin/vocabulary/${wordId}/meanings/${meaningId}`, { text })
    return res.data
  },

  deleteMeaning: async (wordId: number, meaningId: number): Promise<void> => {
    await apiClient.delete(`/admin/vocabulary/${wordId}/meanings/${meaningId}`)
  },

  addExample: async (wordId: number, payload: Omit<VocabExample, 'id'>): Promise<VocabExample> => {
    const res = await apiClient.post<VocabExample>(`/admin/vocabulary/${wordId}/examples`, payload)
    return res.data
  },

  updateExample: async (wordId: number, exampleId: number, payload: Partial<Omit<VocabExample, 'id'>>): Promise<VocabExample> => {
    const res = await apiClient.patch<VocabExample>(`/admin/vocabulary/${wordId}/examples/${exampleId}`, payload)
    return res.data
  },

  deleteExample: async (wordId: number, exampleId: number): Promise<void> => {
    await apiClient.delete(`/admin/vocabulary/${wordId}/examples/${exampleId}`)
  },

  deleteWord: async (wordId: number): Promise<void> => {
    await apiClient.delete(`/admin/vocabulary/${wordId}`)
  },
}

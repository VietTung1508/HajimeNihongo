import {apiClient} from '@/lib/api/apiClient'
import {GrammarListResponse, GrammarSearchResponse, GrammarDetail} from '../types'

export const grammarApi = {
  getGrammarList: async (
    level?: string,
    lesson?: string,
  ): Promise<GrammarListResponse> => {
    const params: Record<string, string> = {}
    if (level) params.level = level
    if (lesson) params.lesson = lesson
    const response = await apiClient.get<GrammarListResponse>('/grammar', {params})
    return response.data
  },

  searchGrammar: async (q: string): Promise<GrammarSearchResponse> => {
    const response = await apiClient.get<GrammarSearchResponse>('/grammar/search', {
      params: {q},
    })
    return response.data
  },

  getGrammarDetail: async (id: number): Promise<GrammarDetail> => {
    const response = await apiClient.get<GrammarDetail>(`/grammar/${id}`)
    return response.data
  },
}

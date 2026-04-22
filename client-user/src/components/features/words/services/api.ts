import {apiClient} from '@/lib/api/apiClient'
import {WordListResponse, WordDetailDTO} from '../types'

export const wordsApi = {
  getWordList: async (params: {
    q?: string
    sort?: string
    page?: number
    commonOnly?: boolean
    limit?: number
  }): Promise<WordListResponse> => {
    const {q = '', sort = 'relevance', page = 1, commonOnly = false, limit = 12} = params
    const response = await apiClient.get<WordListResponse>('/words', {
      params: {q, sort, page, commonOnly, limit},
    })
    return response.data
  },

  getWordDetail: async (id: number): Promise<WordDetailDTO> => {
    const response = await apiClient.get<WordDetailDTO>(`/words/${id}`)
    return response.data
  },
}

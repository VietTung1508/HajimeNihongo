import {apiClient} from '@/lib/api/apiClient'
import {KanaSectionsResponse} from '../types'

export const kanaApi = {
  getKanaSections: async (): Promise<KanaSectionsResponse> => {
    const response = await apiClient.get<KanaSectionsResponse>('/kana')
    return response.data
  },
}

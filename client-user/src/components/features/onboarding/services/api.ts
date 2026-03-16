import {apiClient} from '@/lib/api/apiClient'
import {CreateOnboardingRequest} from '../types'

export const onboardingApi = {
  getOnboardingData: async () => {
    const response = await apiClient.get(`/onboarding/me`)

    return response.data
  },

  createOnboardingData: async (data: CreateOnboardingRequest) => {
    const response = await apiClient.post(`/onboarding`, data)

    return response.data
  },
}

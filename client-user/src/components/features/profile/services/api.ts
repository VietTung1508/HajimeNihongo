import {apiClient} from '@/lib/api/apiClient'

export const profileApi = {
  updateProfile: async (data: {
    username: string
    phoneNumber?: string | null
    gender?: string | null
    dateOfBirth?: string | null
  }) => {
    const response = await apiClient.patch('/auth/me', data)
    return response.data
  },

  updatePassword: async (data: {currentPassword: string; newPassword: string}) => {
    const response = await apiClient.patch('/auth/me/password', data)
    return response.data
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiClient.post('/auth/me/avatar', formData)
    return response.data
  },

  updateOnboarding: async (data: {
    level?: string
    studyPace?: string
    studyPreference?: string
  }) => {
    const response = await apiClient.patch('/onboarding/me', data)
    return response.data
  },
}

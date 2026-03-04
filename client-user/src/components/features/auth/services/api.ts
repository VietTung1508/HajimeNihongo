import {apiClient} from '@/lib/api/apiClient'
import {LoginRequest, RegisterRequest} from '../types/type'

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post(`/auth/register`, data)

    return response.data
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post(`/auth/login`, data)

    return response.data
  },
}

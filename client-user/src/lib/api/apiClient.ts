import axios, {AxiosResponse} from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TIMEOUT = 30000
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'
const ONBOARDING_KEY = 'already_onboarding'

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Check for SESSION_NOT_FOUND status code
      if (error.response?.data?.errorCode === 'SESSION_NOT_FOUND') {
        clearAuthData()
        window.location.href = '/sign-in'
        return Promise.reject(error)
      }

      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const response = await refreshAccessToken(refreshToken)
          const newToken = response.data.accessToken
          setAccessToken(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearAuthData()
        window.location.href = '/sign-in'
      }
    }

    return Promise.reject(error)
  },
)

// Token management
export const getAccessToken = (): string | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return null
  try {
    return Cookies.get(ACCESS_TOKEN_KEY) || null
  } catch (error) {
    console.error('Error getting access token:', error)
    return null
  }
}

export const getRefreshToken = (): string | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return null
  try {
    return Cookies.get(REFRESH_TOKEN_KEY) || null
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return null
  }
}

export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return
  try {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: Number(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES_IN) || 1,
      sameSite: 'strict',
    })
  } catch (error) {
    console.error('Error setting access token:', error)
  }
}

export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return
  try {
    Cookies.set(REFRESH_TOKEN_KEY, token, {
      expires: Number(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES_IN) || 1,
      sameSite: 'strict',
    })
  } catch (error) {
    console.error('Error setting refresh token:', error)
  }
}

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return
  try {
    Cookies.remove(ACCESS_TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
    Cookies.remove(USER_KEY)
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<AxiosResponse<{accessToken: string}>> => {
  return await apiClient.post('auth/refresh', {refreshToken})
}

export const setUser = (user: {email: string; username: string}) => {
  if (typeof window === 'undefined') return

  try {
    Cookies.set(USER_KEY, JSON.stringify(user), {
      expires: 7,
      sameSite: 'strict',
    })
  } catch (error) {
    console.error('Error setting user:', error)
  }
}

export const getUser = (): {email: string; username: string} | null => {
  if (typeof window === 'undefined') return null

  try {
    const user = Cookies.get(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export const getCurrentUser = () => {
  if (!isAuthenticated()) return null
  return getUser()
}

export const isAuthenticated = (): boolean => {
  const token = getAccessToken()
  return token !== null
}

export {apiClient}

export const setAlreadyOnboarding = (value: boolean) => {
  if (typeof window === 'undefined') return

  try {
    Cookies.set(ONBOARDING_KEY, JSON.stringify(value), {
      expires: 7,
      sameSite: 'strict',
    })
  } catch (error) {
    console.error('Error setting onboarding status:', error)
  }
}

export const getAlreadyOnboarding = (): boolean | null => {
  if (typeof window === 'undefined') return null

  try {
    const value = Cookies.get(ONBOARDING_KEY)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('Error getting onboarding status:', error)
    return null
  }
}

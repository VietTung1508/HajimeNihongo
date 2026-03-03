import env from '@/config/env'
import Cookies from 'js-cookie'
import axios, {type AxiosResponse} from 'axios'

export interface User {
  id: string
  email: string
  name: string
  fullname: string
  role: string[]
}

// Constants
const API_BASE_URL = env.API_BASE_URL
const API_TIMEOUT = 30000
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'
const PERMISSIONS_KEY = 'permissions'

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

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<AxiosResponse<{accessToken: string}>> => {
  return await apiClient.post('admin/auth/refresh', {refreshToken})
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
      expires: env.TOKEN_EXPIRES_IN,
      secure: env.SECURE_COOKIES,
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
      expires: env.REFRESH_TOKEN_EXPIRES_IN,
      secure: env.SECURE_COOKIES,
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
    Cookies.remove(PERMISSIONS_KEY)
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

// User data management
export const setUserData = (user: User): void => {
  if (typeof window === 'undefined') return
  try {
    Cookies.set(USER_KEY, JSON.stringify(user), {
      expires: env.TOKEN_EXPIRES_IN,
      secure: env.SECURE_COOKIES,
      sameSite: 'strict',
    })
  } catch (error) {
    console.error('Error setting user data:', error)
  }
}

export const getUserData = (): User | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return null
  try {
    const userData = Cookies.get(USER_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

// JWT utility functions
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true

  const currentTime = Date.now() / 1000
  return decoded.exp < currentTime
}

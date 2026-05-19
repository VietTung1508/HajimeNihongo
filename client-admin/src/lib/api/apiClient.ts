import env from '@/config/env'
import Cookies from 'js-cookie'
import axios from 'axios'

export interface User {
  id: string
  email: string
  name: string
  fullname: string
  role: string[]
}

const API_BASE_URL = env.API_BASE_URL
const API_TIMEOUT = 30000
const ACCESS_TOKEN_KEY = 'admin_access_token'
const USER_KEY = 'admin_user'
const PERMISSIONS_KEY = 'admin_permissions'
const MUST_CHANGE_PASSWORD_KEY = 'must_change_password'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401: clear auth data and redirect to sign-in (no refresh)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData()
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  },
)

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return Cookies.get(ACCESS_TOKEN_KEY) || null
  } catch (error) {
    console.error('Error getting access token:', error)
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

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return
  try {
    Cookies.remove(ACCESS_TOKEN_KEY)
    Cookies.remove(USER_KEY)
    Cookies.remove(PERMISSIONS_KEY)
    Cookies.remove(MUST_CHANGE_PASSWORD_KEY)
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

export const getMustChangePassword = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return Cookies.get(MUST_CHANGE_PASSWORD_KEY) === 'true'
  } catch {
    return false
  }
}

export const setMustChangePassword = (value: boolean): void => {
  if (typeof window === 'undefined') return
  try {
    if (value) {
      Cookies.set(MUST_CHANGE_PASSWORD_KEY, 'true', {
        expires: env.TOKEN_EXPIRES_IN,
        secure: env.SECURE_COOKIES,
        sameSite: 'strict',
      })
    } else {
      Cookies.remove(MUST_CHANGE_PASSWORD_KEY)
    }
  } catch (error) {
    console.error('Error setting must_change_password:', error)
  }
}

export const setPermissions = (permissions: string[]): void => {
  if (typeof window === 'undefined') return
  try {
    Cookies.set(PERMISSIONS_KEY, JSON.stringify(permissions), {
      expires: env.TOKEN_EXPIRES_IN,
      secure: env.SECURE_COOKIES,
      sameSite: 'strict',
    })
  } catch (error) {
    console.error('Error setting permissions:', error)
  }
}

export const getPermissions = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = Cookies.get(PERMISSIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

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
  if (typeof window === 'undefined') return null
  try {
    const userData = Cookies.get(USER_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

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
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  return decoded.exp < Date.now() / 1000
}

export default apiClient

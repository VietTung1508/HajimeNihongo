import apiClient, { setAccessToken, setUserData, setPermissions, clearAuthData, setMustChangePassword } from './apiClient'
import { setAuth, clearAuth, type AdminUser } from '@/store/slices/auth-slice'
import { store } from '@/store'

export const login = async (email: string, password: string): Promise<void> => {
  const response = await apiClient.post<{
    accessToken: string
    user: AdminUser & { permissions: string[]; mustChangePassword?: boolean }
  }>('/admin/auth/login', { email, password })

  const { accessToken, user } = response.data
  const { permissions, mustChangePassword, ...userWithoutPermissions } = user

  setAccessToken(accessToken)
  setUserData(userWithoutPermissions as any)
  setPermissions(permissions)
  setMustChangePassword(mustChangePassword ?? false)
  store.dispatch(setAuth({
    user: userWithoutPermissions,
    permissions,
    isAuthenticated: true,
    mustChangePassword: mustChangePassword ?? false,
  }))
}

export const logout = (): void => {
  clearAuthData()
  store.dispatch(clearAuth())
}

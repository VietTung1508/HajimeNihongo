import apiClient, {setAccessToken, setUserData, clearAuthData} from './apiClient'
import {setAuth, clearAuth, type AdminUser} from '@/store/slices/auth-slice'
import {store} from '@/store'

export const login = async (email: string, password: string): Promise<void> => {
  const response = await apiClient.post<{accessToken: string; user: AdminUser}>(
    '/admin/auth/login',
    {email, password},
  )
  const {accessToken, user} = response.data
  setAccessToken(accessToken)
  setUserData(user as unknown as Parameters<typeof setUserData>[0])
  store.dispatch(setAuth({user, isAuthenticated: true}))
}

export const logout = (): void => {
  clearAuthData()
  store.dispatch(clearAuth())
}

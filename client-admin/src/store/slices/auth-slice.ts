import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getUserData, getAccessToken, getPermissions, getMustChangePassword } from '@/lib/api/apiClient'

export interface AdminUser {
  id: string
  email: string
  username: string
  roles?: { id: string; name: string }[]
}

interface AuthState {
  user: AdminUser | null
  permissions: string[]
  isAuthenticated: boolean
  mustChangePassword: boolean
}

const initialState: AuthState = {
  user: getUserData() as AdminUser | null,
  permissions: getPermissions(),
  isAuthenticated: !!getAccessToken(),
  mustChangePassword: getMustChangePassword(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        user: AdminUser
        permissions: string[]
        isAuthenticated: boolean
        mustChangePassword: boolean
      }>,
    ) {
      state.user = action.payload.user
      state.permissions = action.payload.permissions
      state.isAuthenticated = action.payload.isAuthenticated
      state.mustChangePassword = action.payload.mustChangePassword
    },
    clearAuth(state) {
      state.user = null
      state.permissions = []
      state.isAuthenticated = false
      state.mustChangePassword = false
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer

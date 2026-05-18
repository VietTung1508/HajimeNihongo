import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import {getUserData, getAccessToken} from '@/lib/api/apiClient'

export interface AdminUser {
  id: string
  email: string
  username: string
  role: 'ADMIN'
}

interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: getUserData() as AdminUser | null,
  isAuthenticated: !!getAccessToken(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{user: AdminUser; isAuthenticated: boolean}>) {
      state.user = action.payload.user
      state.isAuthenticated = action.payload.isAuthenticated
    },
    clearAuth(state) {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const {setAuth, clearAuth} = authSlice.actions
export default authSlice.reducer

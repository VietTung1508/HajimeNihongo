import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {
  setAccessToken,
  setRefreshToken,
  clearAuthData,
  setUser,
  getAccessToken,
  getUser,
} from '@/lib/api/apiClient'
import {
  LoginRequest,
  RegisterRequest,
} from '@/components/features/auth/types/type'
import {authApi} from '@/components/features/auth/services/api'

interface AuthState {
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  user: {email: string; username: string} | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
}

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, {rejectWithValue}) => {
    try {
      const response = await authApi.register(data)

      setAccessToken(response.accessToken)
      setUser(response.user)

      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Register failed')
    }
  },
)

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, {rejectWithValue}) => {
    try {
      const response = await authApi.login(data)

      setAccessToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      setUser(response.user)

      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      clearAuthData()
      state.isAuthenticated = false
      state.user = null
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    hydrateAuth: (state) => {
      const token = getAccessToken()
      const user = getUser()

      if (token && user) {
        state.isAuthenticated = true
        state.user = user
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(registerThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {logout, setAuthenticated, hydrateAuth} = authSlice.actions
export default authSlice.reducer

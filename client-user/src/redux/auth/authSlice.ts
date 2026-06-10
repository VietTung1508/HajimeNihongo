import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit'
import {
  setAccessToken,
  setRefreshToken,
  clearAuthData,
  setUser,
  getAccessToken,
  getUser,
  setAlreadyOnboarding,
  getAlreadyOnboarding,
  UserProfile,
} from '@/lib/api/apiClient'
import {
  LoginRequest,
  RegisterRequest,
} from '@/components/features/auth/types/type'
import {authApi} from '@/components/features/auth/services/api'
import {CreateOnboardingRequest} from '@/components/features/onboarding/types'
import {onboardingApi} from '@/components/features/onboarding/services/api'

interface AuthState {
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  user: UserProfile | null
  initialized: boolean
  alreadyOnboard: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  initialized: false,
  alreadyOnboard: false,
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as {response?: {data?: {message?: unknown}}}).response?.data?.message === 'string'
  ) {
    return (error as {response: {data: {message: string}}}).response.data.message
  }

  return fallback
}

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, {rejectWithValue}) => {
    try {
      const response = await authApi.register(data)

      setAccessToken(response.accessToken)
      setAlreadyOnboarding(false)
      setUser(response.user)

      return response
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Register failed'))
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
      setAlreadyOnboarding(response.onboardingCompleted)
      setUser(response.user)

      return response
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Login failed'))
    }
  },
)

export const onboardingThunk = createAsyncThunk(
  '/onboarding',
  async (data: CreateOnboardingRequest, {rejectWithValue}) => {
    try {
      const response = await onboardingApi.createOnboardingData(data)

      setAlreadyOnboarding(response.onboardingCompleted)

      return response
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Onboarding failed'))
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
      state.alreadyOnboard = false
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    hydrateAuth: (state) => {
      const token = getAccessToken()
      const user = getUser()
      const alreadyOnboarding = getAlreadyOnboarding()

      if (token && user) {
        state.isAuthenticated = true
        state.user = user
      }

      if (alreadyOnboarding) {
        state.alreadyOnboard = true
      }

      state.initialized = true
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload}
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
        state.alreadyOnboard = action.payload.onboardingCompleted
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
        state.alreadyOnboard = false
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(onboardingThunk.fulfilled, (state) => {
        state.alreadyOnboard = true
      })
  },
})

export const {logout, setAuthenticated, hydrateAuth, updateUserProfile} = authSlice.actions
export default authSlice.reducer

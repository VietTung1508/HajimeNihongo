import {toast} from 'sonner'
import {LoginRequest, RegisterRequest} from '../types/type'
import {useAppDispatch, useAppSelector} from '@/redux/hooks'
import {loginThunk, registerThunk} from '@/redux/auth/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const {loading, error, isAuthenticated} = useAppSelector(
    (state) => state.auth,
  )

  const register = async (data: RegisterRequest) => {
    const resultAction = await dispatch(registerThunk(data))

    if (registerThunk.fulfilled.match(resultAction)) {
      toast.success('Sign up successfully!')
      return resultAction.payload
    } else {
      const errorMessage =
        (resultAction.payload as string) ||
        resultAction.error?.message ||
        'Register failed'

      toast.error(errorMessage)

      throw new Error(errorMessage)
    }
  }

  const login = async (data: LoginRequest) => {
    const resultAction = await dispatch(loginThunk(data))

    if (loginThunk.fulfilled.match(resultAction)) {
      toast.success('Login successful!')
      return resultAction.payload
    } else {
      const errorMessage =
        (resultAction.payload as string) ||
        resultAction.error?.message ||
        'Register failed'

      toast.error(errorMessage)

      throw new Error(errorMessage)
    }
  }

  return {
    register,
    login,
    loading,
    error,
    isAuthenticated,
  }
}

import {createFileRoute, redirect} from '@tanstack/react-router'
import SignInForm from '@/features/auth/sign-in-form'
import {getAccessToken} from '@/lib/api/apiClient'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: () => {
    if (getAccessToken()) {
      throw redirect({to: '/'})
    }
  },
  component: SignInForm,
})

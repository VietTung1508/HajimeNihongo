import {createFileRoute, redirect} from '@tanstack/react-router'
import AppLayout from '@/components/layout/app-layout'
import {getAccessToken, getMustChangePassword} from '@/lib/api/apiClient'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({location}) => {
    if (!getAccessToken()) {
      throw redirect({to: '/sign-in'})
    }
    if (getMustChangePassword() && location.pathname !== '/change-password') {
      throw redirect({to: '/change-password'})
    }
  },
  component: AppLayout,
})

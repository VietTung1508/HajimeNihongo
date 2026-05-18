import {createFileRoute, redirect} from '@tanstack/react-router'
import AppLayout from '@/components/layout/app-layout'
import {getAccessToken} from '@/lib/api/apiClient'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!getAccessToken()) {
      throw redirect({to: '/sign-in'})
    }
  },
  component: AppLayout,
})

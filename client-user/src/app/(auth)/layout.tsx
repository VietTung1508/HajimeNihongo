'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from '@/components/features/auth/hook/useAuth'

export default function AuthLayout({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const {isAuthenticated, alreadyOnboard} = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      if (alreadyOnboard) return router.replace('/dashboard')

      router.replace('/onboarding')
    }
  }, [isAuthenticated, router])

  return <>{children}</>
}

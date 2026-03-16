'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useAuth} from '@/components/features/auth/hook/useAuth'

export default function MainLayout({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const {isAuthenticated, initialized} = useAuth()

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/')
    }
  }, [initialized, isAuthenticated, router])

  if (!initialized) return null

  return <>{children}</>
}

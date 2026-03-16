'use client'

import {useRouter} from 'next/navigation'
import {useAuth} from '../auth/hook/useAuth'
import {useEffect} from 'react'

const DashboardMain = () => {
  const router = useRouter()
  const {alreadyOnboard} = useAuth()

  useEffect(() => {
    if (!alreadyOnboard) {
      router.replace('/onboarding')
    }
  }, [alreadyOnboard, router])
  return <div></div>
}

export default DashboardMain

'use client'

import {useEffect} from 'react'
import {useAppDispatch} from '@/redux/hooks'
import {hydrateAuth} from '@/redux/auth/authSlice'

export default function AuthProvider({children}: {children: React.ReactNode}) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(hydrateAuth())
  }, [dispatch])

  return <>{children}</>
}

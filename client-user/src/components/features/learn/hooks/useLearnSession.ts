'use client'

import {useEffect, useState, useRef} from 'react'
import {useMarkItemAsViewed, useItemStatus} from './useLearn'
import {useRouter} from 'next/navigation'

const VIEW_DURATION_SECONDS = 10

export function useLearnSession(learnItemId: number) {
  const router = useRouter()

  const [timeLeft, setTimeLeft] = useState(VIEW_DURATION_SECONDS)
  const [canView, setCanView] = useState(false)
  const {markItemAsViewed, isPending} = useMarkItemAsViewed()
  const {data: itemStatus} = useItemStatus(learnItemId)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasTrackedView = useRef(false)
  const hasMarkedRef = useRef(false)

  useEffect(() => {
    if (itemStatus?.viewedAt) {
      setCanView(true)
      setTimeLeft(0)
      hasTrackedView.current = true
    }
  }, [itemStatus])

  useEffect(() => {
    if (hasTrackedView.current) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setCanView(true)
          hasTrackedView.current = true

          if (!hasMarkedRef.current && !isNaN(learnItemId)) {
            hasMarkedRef.current = true
            markItemAsViewed(learnItemId)
          }

          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [learnItemId])

  const handleNext = () => {
    router.push('/learn')
  }

  return {
    timeLeft,
    canView,
    isPending,
    handleNext,
  }
}

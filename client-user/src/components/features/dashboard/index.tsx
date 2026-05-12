'use client'

import {useRouter} from 'next/navigation'
import {useAuth} from '../auth/hook/useAuth'
import {useEffect} from 'react'
import {LearningSection} from './LearningSection'
import {ActivityChart} from './ActivityChart'
import {RecentBookmarks} from './RecentBookmarks'
import {WeakAreas} from './WeakAreas'
import {StatsCard} from './StatsCard'

const DashboardMain = () => {
  const router = useRouter()
  const {alreadyOnboard} = useAuth()

  useEffect(() => {
    if (!alreadyOnboard) {
      router.replace('/onboarding')
    }
  }, [alreadyOnboard, router])

  if (!alreadyOnboard) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-340">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mb-1">
            はじめましょう！Let&apos;s Begin!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            あなたの学習進捗を追跡 • Track your learning progress
          </p>
        </div>

        {/* Bento Grid Layout - Balanced 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Row 1: Learning Section (wide) + Stats Card (narrow) */}
          <div className="lg:col-span-3">
            <LearningSection />
          </div>

          <div className="lg:col-span-1">
            <StatsCard />
          </div>

          {/* Row 2: Activity Chart (medium) + Bookmarks (narrow) + Weak Areas (narrow) */}
          <div className="lg:col-span-2">
            <ActivityChart />
          </div>

          <div className="lg:col-span-1">
            <RecentBookmarks />
          </div>

          <div className="lg:col-span-1">
            <WeakAreas />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardMain

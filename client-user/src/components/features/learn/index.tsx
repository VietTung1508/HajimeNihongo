'use client'

import {useTodayLearn, usePushToReview, useGenerateDailyLearn, useGenerateExtraBatch} from './hooks/useLearn'
import {ExtendedLearnItem, ItemState} from './types'
import {useRouter} from 'next/navigation'
import {useEffect, useMemo} from 'react'
import {Loader2, Inbox, Flame, Calendar, Award, CheckCircle2, Plus} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {useStreak} from './hooks/useLearn'
import {cn} from '@/lib/utils'

export function LearnMain() {
  const router = useRouter()
  const {data: todayLearn, isLoading, error, refetch} = useTodayLearn()
  const {pushToReview, isPending: isPushing} = usePushToReview()
  const {generateDailyLearn, isPending: isGenerating} = useGenerateDailyLearn()
  const {generateExtraBatch, isPending: isGeneratingExtra} = useGenerateExtraBatch()
  const {data: streak, refetch: refetchStreak} = useStreak()

  // Refetch data on mount and window focus to get fresh status after reviews
  useEffect(() => {
    refetch()
    refetchStreak()
  }, [refetch, refetchStreak])

  // Also refetch when window gains focus (user navigates back from review)
  useEffect(() => {
    const handleFocus = () => {
      refetch()
      refetchStreak()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetch, refetchStreak])

  const viewedCount = useMemo(() => {
    return todayLearn?.items?.filter(item => item.viewedAt).length ?? 0
  }, [todayLearn])

  const extendedItems = useMemo<ExtendedLearnItem[]>(() => {
    if (!todayLearn?.items) return []

    let firstUnlockedIndex = 0

    return todayLearn.items.map((item, index) => {
      let state: ItemState = 'locked'

      if (item.viewedAt) {
        state = 'viewed'
      } else if (index === firstUnlockedIndex || (index > 0 && todayLearn.items[index - 1]?.viewedAt)) {
        state = 'viewable'
        if (!item.viewedAt) firstUnlockedIndex = index + 1
      }

      return {...item, state}
    })
  }, [todayLearn])

  const allViewed = viewedCount > 0 && viewedCount === extendedItems.length
  const hasItems = extendedItems.length > 0

  // Check if all viewed items have already been pushed to review
  const allPushedToReview = useMemo(() => {
    return extendedItems.length > 0 && extendedItems.every(item => item.viewedAt && item.pushedToReviewAt)
  }, [extendedItems])

  // Check if all items are mastered (true completion)
  // An item only counts as mastered if it was viewed AND mastered
  const allMastered = useMemo(() => {
    return extendedItems.length > 0 && extendedItems.every(item => item.masteredAt && item.viewedAt)
  }, [extendedItems])

  const handleCardClick = (item: ExtendedLearnItem) => {
    if (item.state === 'viewable') {
      if (item.type === 'word') {
        router.push(`/vocabulary/${item.wordId}?learn=${item.id}`)
      } else {
        router.push(`/grammar/${item.grammarId}?learn=${item.id}`)
      }
    }
  }

  const handlePushToReview = async () => {
    await pushToReview()
    router.push('/review')
  }

  const handleGenerateNow = async () => {
    await generateDailyLearn()
  }

  const handleGenerateExtra = async () => {
    await generateExtraBatch()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto size-12 animate-spin text-[#c74a4a]" />
          <p className="text-lg text-muted-foreground">Loading today&apos;s learning...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold">Failed to load learning content</h2>
          <p className="text-muted-foreground">
            Please check your connection and try again.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!hasItems) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <Inbox className="mx-auto size-20 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Learning Content Today</h2>
          <p className="text-muted-foreground">
            Complete your onboarding to get personalized daily learning content.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleGenerateNow}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? 'Generating...' : 'Generate Now'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Today&apos;s Learning</h1>
          {todayLearn?.isExtraBatch && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700">
              Weekend Warrior 💪
            </span>
          )}
        </div>
        {streak && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Flame className="size-5 text-orange-500" />
              <span className="font-semibold">{streak.currentStreak} day streak</span>
            </div>
            {streak.longestStreak > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="size-4" />
                <span>Best: {streak.longestStreak}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {viewedCount} of {extendedItems.length} items viewed
          </span>
          {allViewed && (
            <span className="text-sm font-semibold text-green-600">All viewed!</span>
          )}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              allViewed ? 'bg-green-500' : 'bg-[#c74a4a]'
            )}
            style={{width: `${(viewedCount / extendedItems.length) * 100}%`}}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {extendedItems.map((item, index) => (
          <LearningCard
            key={item.id}
            item={item}
            index={index}
            onClick={() => handleCardClick(item)}
          />
        ))}
      </div>

      {/* Show review button for any viewed items that haven't been pushed yet */}
      {allViewed && !allPushedToReview && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handlePushToReview}
            disabled={isPushing}
            className="gap-2"
          >
            <Calendar className="size-5" />
            {isPushing ? 'Preparing...' : 'Start Review'}
          </Button>
        </div>
      )}

      {/* Show completion section only when all items are mastered AND pushed to review */}
      {allViewed && allPushedToReview && allMastered && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 p-8 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle2 className="size-16 text-green-500" />
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
            {todayLearn?.isExtraBatch ? 'Extra Batch Complete! 🎉' : 'All done for today! 🎉'}
          </h2>
          <p className="text-center text-green-700 dark:text-green-300 max-w-md">
            {todayLearn?.isExtraBatch
              ? 'You\'ve completed this extra batch! Generate more practice or come back tomorrow.'
              : 'You\'ve completed all your learning and reviews for today. Come back tomorrow for more!'}
          </p>
          {streak && streak.currentStreak > 0 && (
            <div className="flex items-center gap-2 text-lg font-semibold text-orange-600 dark:text-orange-400">
              <Flame className="size-6" />
              <span>{streak.currentStreak} day streak!</span>
            </div>
          )}
          <div className="flex gap-3 mt-4 flex-wrap justify-center">
            <Button
              variant="outline"
              onClick={handleGenerateExtra}
              disabled={isGeneratingExtra}
              className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950 min-w-[180px]"
            >
              {isGeneratingExtra ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Generate Extra Batch
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              Back to Dashboard
            </Button>
          </div>
          <p className="text-xs text-center text-green-600/70 dark:text-green-400/70 mt-2">
            Want to learn more? Generate an extra batch for weekend warrior mode! 💪
          </p>
        </div>
      )}

      {/* Show "Ready for Review" when items are pushed but not all mastered yet */}
      {allPushedToReview && !allMastered && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 p-8 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <Calendar className="size-16 text-blue-500" />
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            Ready for Review!
          </h2>
          <p className="text-center text-blue-700 dark:text-blue-300 max-w-md">
            You&apos;ve learned all today&apos;s items. Complete your reviews to finish today&apos;s learning session!
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => router.push('/review')}
              className="gap-2"
            >
              Go to Review
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface LearningCardProps {
  item: ExtendedLearnItem
  index: number
  onClick: () => void
}

function LearningCard({item, index, onClick}: LearningCardProps) {
  const isViewable = item.state === 'viewable'
  const isViewed = item.state === 'viewed'

  return (
    <button
      onClick={onClick}
      disabled={!isViewable && !isViewed}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all',
        isViewable && 'hover:border-[#c74a4a] hover:shadow-md cursor-pointer',
        isViewed && 'border-green-500 bg-green-50 dark:bg-green-950',
        !isViewable && !isViewed && 'opacity-50 cursor-not-allowed border-muted'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted">
              #{index + 1}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary">
              {item.type}
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
          {item.subtitle && (
            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
          )}
        </div>

        <div className="ml-4">
          {isViewed && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
              ✓
            </div>
          )}
          {isViewable && !isViewed && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#c74a4a] text-[#c74a4a]">
              →
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

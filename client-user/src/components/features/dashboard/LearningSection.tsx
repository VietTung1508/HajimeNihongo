'use client'

import {useRouter} from 'next/navigation'
import {useQueryClient} from '@tanstack/react-query'
import {Button} from '@/components/ui/button'
import {Progress} from '@/components/ui/progress'
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {Card} from '@/components/ui/card'
import {Loader2} from 'lucide-react'
import {useLearningProgress, useReviewQueue} from './hooks/use-learning-progress'
import {BookOpen, RotateCw, ArrowRight, Plus, ChevronDown} from 'lucide-react'

export function LearningSection() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {data: learnData, isLoading: learnLoading} = useLearningProgress()
  const {data: reviewData, isLoading: reviewLoading} = useReviewQueue()

  const handleRefresh = () => {
    queryClient.invalidateQueries({queryKey: ['review-queue-summary']})
  }

  if (learnLoading || reviewLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="flex items-center justify-center p-12 h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  const completedCount = learnData?.completed ?? 0
  const totalCount = learnData?.total ?? 0
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const totalReview = reviewData?.total ?? 0
  const grammarCount = reviewData?.counts?.grammar ?? 0
  const vocabCount = reviewData?.counts?.word ?? 0

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <BookOpen className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Today&apos;s Learning
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completedCount > 0 ? `✓ ${completedCount} mastered today` : 'Continue your progress'}
            </p>
          </div>
        </div>

        {/* 2x2 Grid - 4 Equal Buttons */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {/* Learn Button */}
          <button
            onClick={() => router.push('/learn')}
            className="group p-4 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-white">Learn</span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <Progress value={progressPercent} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {completedCount} / {totalCount}
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          </button>

          {/* Review Button with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group p-4 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 dark:text-white">Review</span>
                  <div className="flex items-center gap-2">
                    {totalReview > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        {typeof totalReview === 'number' ? totalReview : 0}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {typeof totalReview === 'number' && totalReview > 0 ? `${totalReview} items` : 'All caught up!'}
                </p>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push('/review?type=grammar')}>
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-sm font-medium">Grammar</span>
                  <span className="text-xs text-slate-500">{typeof grammarCount === 'number' ? grammarCount : 0} items</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/review?type=vocab')}>
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-sm font-medium">Vocabulary</span>
                  <span className="text-xs text-slate-500">{typeof vocabCount === 'number' ? vocabCount : 0} items</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/review')}>
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-sm font-medium">Mixed</span>
                  <span className="text-xs text-slate-500">{typeof totalReview === 'number' ? totalReview : 0} items</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRefresh}>
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-sm font-medium">Refresh</span>
                  <RotateCw className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Words Button */}
          <button
            onClick={() => router.push('/vocabulary')}
            className="group p-4 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-white">Add Words</span>
              <Plus className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse vocabulary
            </p>
          </button>

          {/* Add Grammar Button */}
          <button
            onClick={() => router.push('/grammar')}
            className="group p-4 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-white">Add Grammar</span>
              <Plus className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse grammar points
            </p>
          </button>
        </div>
      </div>
    </Card>
  )
}

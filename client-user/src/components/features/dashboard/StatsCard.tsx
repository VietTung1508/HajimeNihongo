'use client'

import {Card} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'
import {useStats} from './hooks/use-dashboard-data'
import {Loader2} from 'lucide-react'
import {Flame, Calendar, Target, BookOpen} from 'lucide-react'

export function StatsCard() {
  const {data, isLoading, error} = useStats()

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="flex items-center justify-center p-8 h-full">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <Flame className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No stats yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Complete your first lesson to track your progress</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
      <div className="p-6 space-y-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/30">
            <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-3xl font-semibold text-slate-900 dark:text-white">
              {data.currentStreak}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">day streak</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-400" />
            JLPT Progress
          </h3>
          <div className="space-y-3">
            {(Object.keys(data.jlptProgress) as Array<keyof typeof data.jlptProgress>).map((level) => {
              const progress = data.jlptProgress[level]
              const percent = progress.total > 0 ? (progress.mastered / progress.total) * 100 : 0
              const levelColors = {
                N5: 'bg-emerald-500 dark:bg-emerald-400',
                N4: 'bg-blue-500 dark:bg-blue-400',
                N3: 'bg-indigo-500 dark:bg-indigo-400',
                N2: 'bg-violet-500 dark:bg-violet-400',
                N1: 'bg-rose-500 dark:bg-rose-400'
              }
              return (
                <div key={level} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{level}</span>
                    <span className="text-slate-500 dark:text-slate-400">{progress.mastered}/{progress.total}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${levelColors[level as keyof typeof levelColors]} rounded-full transition-all duration-300`}
                      style={{width: `${percent}%`}}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <Calendar className="h-4 w-4 mx-auto mb-1.5 text-slate-400" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{data.daysStudied}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Days</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <Target className="h-4 w-4 mx-auto mb-1.5 text-slate-400" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{data.lastSessionAccuracy}%</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Accuracy</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <BookOpen className="h-4 w-4 mx-auto mb-1.5 text-slate-400" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {data.totalItemsStudied >= 1000 ? `${(data.totalItemsStudied / 1000).toFixed(1)}k` : data.totalItemsStudied}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Items</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

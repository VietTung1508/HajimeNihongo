'use client'

import {Card} from '@/components/ui/card'
import {useWeakAreas} from './hooks/use-dashboard-data'
import {Loader2} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {useRouter} from 'next/navigation'
import {Target} from 'lucide-react'

export function WeakAreas() {
  const router = useRouter()
  const {data, isLoading, error} = useWeakAreas()

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="flex items-center justify-center p-8 h-full">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="p-6 text-center text-sm text-slate-500">Failed to load</div>
      </Card>
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Target className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Weak Areas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Focus areas</p>
            </div>
          </div>
          <div className='flex items-center justify-center flex-col h-full'>
            <div className="text-center py-6">
            <Target className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">All good!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keep reviewing to maintain your progress</p>
          </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Target className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Weak Areas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Focus on these</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-2">
        {data.data.slice(0, 4).map((item) => {
          const accuracyLevel = item.accuracy < 40 ? 'critical' : item.accuracy < 60 ? 'warning' : 'moderate'
          const levelStyles = {
            critical: {
              bg: 'bg-red-50/50 dark:bg-red-950/20',
              border: 'border-red-200 dark:border-red-900/30',
              badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
            },
            warning: {
              bg: 'bg-amber-50/50 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-900/30',
              badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            },
            moderate: {
              bg: 'bg-slate-50/50 dark:bg-slate-800/30',
              border: 'border-slate-200 dark:border-slate-700',
              badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }
          }

          const styles = levelStyles[accuracyLevel]

          return (
            <div
              key={`${item.type}-${item.id}`}
              className={`group p-3 rounded-lg border ${styles.border} ${styles.bg} hover:shadow-sm transition-all cursor-pointer`}
              onClick={() => router.push(item.type === 'word' ? `/vocabulary/${item.id}` : `/grammar/${item.id}`)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${styles.badge}`}>
                      {item.type}
                    </Badge>
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {item.japanese}
                    </span>
                  </div>
                </div>
                <div className={`text-sm font-semibold ${styles.badge} px-2 py-0.5 rounded`}>
                  {item.accuracy}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

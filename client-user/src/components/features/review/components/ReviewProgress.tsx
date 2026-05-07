'use client'

import {cn} from '@/lib/utils'

interface ReviewProgressProps {
  current: number
  total: number
  className?: string
}

export function ReviewProgress({current, total, className}: ReviewProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0
  const displayPercentage = Math.min(100, Math.max(0, percentage))

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[#c74a4a] transition-all duration-500 ease-out"
          style={{width: `${displayPercentage}%`}}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Progress
        </span>
        <span className="font-semibold text-foreground">
          {current} / {total}
        </span>
      </div>
    </div>
  )
}

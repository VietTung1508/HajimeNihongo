'use client'

import {useLearnSession} from '@/components/features/learn/hooks/useLearnSession'
import {Button} from '@/components/ui/button'
import {Loader2, Clock} from 'lucide-react'
import {cn} from '@/lib/utils'

interface LearnSessionBarProps {
  learnItemId: number
  className?: string
}

export function LearnSessionBar({learnItemId, className}: LearnSessionBarProps) {
  const {timeLeft, canView, isPending, handleNext} = useLearnSession(learnItemId)

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className={cn(
              'size-5',
              canView ? 'text-green-500' : 'text-muted-foreground'
            )} />
            {canView ? (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Lesson complete! You can mark as reviewed.
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {timeLeft} {timeLeft === 1 ? 'second' : 'seconds'} remaining...
              </span>
            )}
          </div>

          {canView && (
            <Button
              onClick={handleNext}
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Next
            </Button>
          )}
        </div>
    </div>
  )
}

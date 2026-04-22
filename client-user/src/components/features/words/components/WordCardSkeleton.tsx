'use client'

import {Card, CardContent} from '@/components/ui/card'
import {Skeleton} from '@/components/ui/skeleton'

export function WordCardSkeleton() {
  return (
    <Card>
      <CardContent className='p-4'>
        {/* Top row */}
        <div className='flex items-center justify-between gap-2 mb-2'>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-8 w-8 rounded' />
        </div>
        {/* Meanings */}
        <div className='space-y-1 mb-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>
        {/* Badges */}
        <div className='flex items-center justify-end gap-1'>
          <Skeleton className='h-5 w-8' />
          <Skeleton className='h-5 w-14' />
        </div>
      </CardContent>
    </Card>
  )
}
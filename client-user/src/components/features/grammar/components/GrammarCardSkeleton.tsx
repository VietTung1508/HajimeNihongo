import {Card, CardContent} from '@/components/ui/card'
import {Skeleton} from '@/components/ui/skeleton'

export function GrammarCardSkeleton() {
  return (
    <Card>
      <CardContent className='p-4 space-y-2'>
        <div className='flex justify-between'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-6 w-6 rounded-md' />
        </div>
        <div className='flex gap-1'>
          <Skeleton className='h-4 w-8' />
          <Skeleton className='h-4 w-8' />
        </div>
        <Skeleton className='h-4 w-full' />
      </CardContent>
    </Card>
  )
}

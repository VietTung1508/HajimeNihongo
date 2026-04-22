'use client'

import {useRouter} from 'next/navigation'
import {Clock} from 'lucide-react'
import {toast} from 'sonner'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface WordSelectionBarProps {
  selectedIds: number[]
  onStopSelecting: () => void
}

export function WordSelectionBar({selectedIds, onStopSelecting}: WordSelectionBarProps) {
  const router = useRouter()
  const count = selectedIds.length

  const handleLearn = () => {
    router.push(`/learn?words=${selectedIds.join(',')}`)
  }

  const handleAddToReviews = () => {
    toast.success(`Added ${count} word${count > 1 ? 's' : ''} to reviews`)
  }

  const handleMarkMastered = () => {
    toast.success(`Marked ${count} word${count > 1 ? 's' : ''} as mastered`)
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
        {/* Left: Stop Selecting */}
        <Button variant='outline' onClick={onStopSelecting}>
          ■ Stop Selecting
        </Button>

        {/* Right: Cram, Reviews Actions, Learn */}
        <div className='flex items-center gap-2'>
          {/* Cram — static stub */}
          <Button variant='outline' disabled>
            <Clock className='h-4 w-4 mr-2' />
            Cram
          </Button>

          {/* Reviews Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <span className='mr-2'>⋮</span>
                Reviews
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleAddToReviews}>
                Add to reviews
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMarkMastered}>
                Mark as mastered
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Learn — primary button */}
          <Button onClick={handleLearn}>
            Learn
          </Button>
        </div>
      </div>
    </div>
  )
}

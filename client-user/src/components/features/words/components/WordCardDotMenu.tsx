'use client'

import {MoreVertical} from 'lucide-react'
import {toast} from 'sonner'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface WordCardDotMenuProps {
  wordId: number
}

export function WordCardDotMenu({wordId}: WordCardDotMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => toast.success('Added to reviews')}>
          Add to reviews
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success('Marked as mastered')}>
          Mark as mastered
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success('Bookmarked')}>
          Add bookmark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
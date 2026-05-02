'use client'

import {MoreVertical} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useBookmark} from '@/features/bookmarks/hook/useBookmark'

interface GrammarCardDotMenuProps {
  grammarId: number
  isBookmarked?: boolean
}

export function GrammarCardDotMenu({grammarId, isBookmarked = false}: GrammarCardDotMenuProps) {
  const {toggleBookmark} = useBookmark({type: 'grammar'})

  const handleBookmarkClick = () => {
    toggleBookmark.mutate({
      id: grammarId,
      action: isBookmarked ? 'remove' : 'add',
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => console.log('Add to reviews')}>
          Add to reviews
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Mark as mastered')}>
          Mark as mastered
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBookmarkClick}>
          {isBookmarked ? 'Remove from Bookmark' : 'Add to Bookmark'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

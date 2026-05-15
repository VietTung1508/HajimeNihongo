'use client'

import {useRouter} from 'next/navigation'
import {MoreVertical, BookmarkPlus, CheckCheck, BookmarkIcon, Bot} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useBookmark} from '@/features/bookmarks/hook/useBookmark'
import { useAddToQueue, useQueuedIds, useRemoveFromQueue, useMarkAsMastered, useMasteredIds } from '../../review/hook/useReviewQueue'

interface GrammarCardDotMenuProps {
  grammarId: number
  grammarPoint: string
  isBookmarked?: boolean
}

export function GrammarCardDotMenu({grammarId, grammarPoint, isBookmarked = false}: GrammarCardDotMenuProps) {
  const router = useRouter()
  const {toggleBookmark} = useBookmark({type: 'grammar'})
  const {data: queuedIds} = useQueuedIds('grammar')
  const {data: masteredIds} = useMasteredIds('grammar')
  const {addGrammar, isAddingGrammar} = useAddToQueue()
  const {removeGrammar, isRemovingGrammar} = useRemoveFromQueue()
  const {markGrammar, unmarkGrammar, isMarkingGrammar, isUnmarkingGrammar} = useMarkAsMastered()

  const isAddedToQueue = queuedIds?.ids.includes(grammarId) ?? false
  const isMastered = masteredIds?.ids.includes(grammarId) ?? false

  const handleBookmarkClick = () => {
    toggleBookmark.mutate({
      id: grammarId,
      action: isBookmarked ? 'remove' : 'add',
    })
  }

  const handleAddToReviews = () => {
    addGrammar([grammarId])
  }

  const handleRemoveFromReviews = () => {
    removeGrammar([grammarId])
  }

  const handleToggleMastered = () => {
    if (isMastered) {
      unmarkGrammar([grammarId])
    } else {
      markGrammar([grammarId])
    }
  }

  const handleAskChatbot = () => {
    const prompt = `Explain this grammar point: ${grammarPoint}`
    router.push(`/chat?ask=${encodeURIComponent(prompt)}`)
  }

  const isProcessing = isAddingGrammar || isRemovingGrammar || isMarkingGrammar || isUnmarkingGrammar

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {/* Show Add/Remove from reviews only if not mastered */}
        {!isMastered && (
          <DropdownMenuItem
            onClick={isAddedToQueue ? handleRemoveFromReviews : handleAddToReviews}
            disabled={isProcessing}
          >
            <BookmarkPlus size={15} className='mr-2' />
            {isAddingGrammar || isRemovingGrammar
              ? 'Processing...'
              : isAddedToQueue
                ? 'Remove from reviews'
                : 'Add to reviews'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleToggleMastered}
          disabled={isProcessing}
        >
          <CheckCheck size={15} className='mr-2' />
          {isMarkingGrammar || isUnmarkingGrammar
            ? 'Processing...'
            : isMastered
              ? 'Unmark as mastered'
              : 'Mark as mastered'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBookmarkClick}>
          <BookmarkIcon size={15} className='mr-2' />
          {isBookmarked ? 'Remove from Bookmark' : 'Add to Bookmark'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAskChatbot}>
          <Bot size={15} className='mr-2' />
          Ask Chatbot
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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

interface WordCardDotMenuProps {
  wordId: number
  wordLabel: string
  isBookmarked?: boolean
}

export function WordCardDotMenu({wordId, wordLabel, isBookmarked = false}: WordCardDotMenuProps) {
  const router = useRouter()
  const {toggleBookmark} = useBookmark({type: 'word'})
  const {data: queuedIds} = useQueuedIds('word')
  const {data: masteredIds} = useMasteredIds('word')
  const {addWord, isAddingWord} = useAddToQueue()
  const {removeWord, isRemovingWord} = useRemoveFromQueue()
  const {markWord, unmarkWord, isMarkingWord, isUnmarkingWord} = useMarkAsMastered()

  const isAddedToQueue = queuedIds?.ids.includes(wordId) ?? false
  const isMastered = masteredIds?.ids.includes(wordId) ?? false

  const handleBookmarkClick = () => {
    toggleBookmark.mutate({
      id: wordId,
      action: isBookmarked ? 'remove' : 'add',
    })
  }

  const handleAddToReviews = () => {
    addWord([wordId])
  }

  const handleRemoveFromReviews = () => {
    removeWord([wordId])
  }

  const handleToggleMastered = () => {
    if (isMastered) {
      unmarkWord([wordId])
    } else {
      markWord([wordId])
    }
  }

  const handleAskChatbot = () => {
    const prompt = `Explain this word: ${wordLabel}`
    router.push(`/chat?ask=${encodeURIComponent(prompt)}`)
  }

  const isProcessing = isAddingWord || isRemovingWord || isMarkingWord || isUnmarkingWord

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
            {isAddingWord || isRemovingWord
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
          {isMarkingWord || isUnmarkingWord
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

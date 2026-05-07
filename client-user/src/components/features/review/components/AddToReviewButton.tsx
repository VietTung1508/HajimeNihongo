'use client'

import {Button} from '@/components/ui/button'
import {BookmarkPlus, BookmarkCheck} from 'lucide-react'
import {useAddToQueue, useQueuedIds, useRemoveFromQueue} from '../hook/useReviewQueue'
import {Loader2} from 'lucide-react'

interface AddToReviewButtonProps {
  type: 'word' | 'grammar'
  itemId: number
}

export function AddToReviewButton({type, itemId}: AddToReviewButtonProps) {
  const {data: queuedIds, isLoading: isCheckingStatus} = useQueuedIds(type)
  const {addWord, addGrammar, isAddingWord, isAddingGrammar} = useAddToQueue()
  const {removeWord, removeGrammar, isRemovingWord, isRemovingGrammar} =
    useRemoveFromQueue()

  const isAdded = queuedIds?.ids.includes(itemId) ?? false
  const isLoading =
    isCheckingStatus ||
    (type === 'word' ? isAddingWord || isRemovingWord : isAddingGrammar || isRemovingGrammar)

  const handleClick = () => {
    if (isAdded) {
      // Remove from queue
      if (type === 'word') {
        removeWord([itemId])
      } else {
        removeGrammar([itemId])
      }
    } else {
      if (type === 'word') {
        addWord([itemId])
      } else {
        addGrammar([itemId])
      }
    }
  }

  return (
    <Button
      variant={isAdded ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {isAdded ? 'Removing...' : 'Adding...'}
        </>
      ) : (
        <>
          {isAdded ? (
            <>
              <BookmarkCheck className="size-4" />
              Remove from Review
            </>
          ) : (
            <>
              <BookmarkPlus className="size-4" />
              Add to Review
            </>
          )}
        </>
      )}
    </Button>
  )
}

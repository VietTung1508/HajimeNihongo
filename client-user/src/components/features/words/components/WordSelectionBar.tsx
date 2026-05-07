'use client'

import {useRouter} from 'next/navigation'
import {
  BookmarkPlus,
  CheckCheck,
  BookmarkIcon,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useAddToQueue, useMarkAsMastered, useMasteredIds} from '@/components/features/review/hook/useReviewQueue'
import {useBookmark} from '@/features/bookmarks/hook/useBookmark'
import {toast} from 'sonner'

interface WordSelectionBarProps {
  selectedIds: number[]
  onStopSelecting: () => void
}

export function WordSelectionBar({
  selectedIds,
  onStopSelecting,
}: WordSelectionBarProps) {
  const router = useRouter()
  const count = selectedIds.length

  const {data: masteredIdsData} = useMasteredIds('word')
  const masteredIds = new Set(masteredIdsData?.ids ?? [])

  const {useGetBookmarkedIds, bulkAddBookmarks} = useBookmark({type: 'word'})
  const {data: bookmarkedIds} = useGetBookmarkedIds()
  const bookmarkedIdsSet = new Set(bookmarkedIds ?? [])

  const {addWord, isAddingWord} = useAddToQueue()
  const {markWord, isMarkingWord} = useMarkAsMastered()

  const handleLearn = () => {
    router.push(`/learn?words=${selectedIds.join(',')}`)
  }

  const handleAddToBookMark = () => {
    bulkAddBookmarks.mutate(selectedIds, {
      onSuccess: () => {
        onStopSelecting()
      },
    })
  }

  const handleAddToReviews = () => {
    addWord(selectedIds)
    // Stop selecting after adding to reviews (hook handles success toast)
    onStopSelecting()
  }

  const handleMarkMastered = () => {
    markWord(selectedIds)
    // Stop selecting after marking as mastered (hook handles success toast)
    onStopSelecting()
  }

  // Check if any selected item is mastered
  const hasMasteredItems = selectedIds.some(id => masteredIds.has(id))

  // Check if all selected items are already bookmarked
  const allBookmarked = selectedIds.length > 0 && selectedIds.every(id => bookmarkedIdsSet.has(id))

  const isProcessing = isAddingWord || isMarkingWord || bulkAddBookmarks.isPending

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
            <BookmarkPlus className='h-4 w-4 mr-2' />
            Cram
          </Button>

          {/* Reviews Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' disabled={isProcessing}>
                <span className='mr-2'>⋮</span>
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={handleAddToReviews}
                disabled={isProcessing || hasMasteredItems}
              >
                <BookmarkPlus size={15} className='mr-2' />
                Add to reviews
                {hasMasteredItems && (
                  <span className='ml-auto text-xs text-muted-foreground'>
                    (mastered items selected)
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleMarkMastered}
                disabled={isProcessing || hasMasteredItems}
              >
                <CheckCheck size={15} className='mr-2' />
                Mark as mastered
                {hasMasteredItems && (
                  <span className='ml-auto text-xs text-muted-foreground'>
                    (already mastered)
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleAddToBookMark}
                disabled={isProcessing || allBookmarked}
              >
                <BookmarkIcon size={15} className='mr-2' />
                Add to bookmark
                {allBookmarked && (
                  <span className='ml-auto text-xs text-muted-foreground'>
                    (all bookmarked)
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Learn — primary button */}
          <Button onClick={handleLearn}>Learn</Button>
        </div>
      </div>
    </div>
  )
}

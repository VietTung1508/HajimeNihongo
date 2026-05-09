'use client'

import {Button} from '@/components/ui/button'
import {BookmarkPlus, CheckCheck, StickyNote} from 'lucide-react'
import {toast} from 'sonner'
import {WordDetailDTO} from '../types'
import {AddToReviewButton} from '@/components/features/review/components/AddToReviewButton'
import {useMasteredIds, useMarkAsMastered} from '@/components/features/review/hook/useReviewQueue'

interface ActionButtonsProps {
  word: WordDetailDTO
}

export function ActionButtons({word}: ActionButtonsProps) {
  const {data: masteredIds} = useMasteredIds('word')
  const {markWord, unmarkWord, isMarkingWord, isUnmarkingWord} = useMarkAsMastered()

  const isMastered = masteredIds?.ids.includes(word.id) ?? false

  const handleToggleMastered = () => {
    if (isMastered) {
      unmarkWord([word.id])
      toast.success(`"${word.kanji || word.reading}" unmarked as mastered.`)
    } else {
      markWord([word.id])
      toast.success(`"${word.kanji || word.reading}" marked as mastered.`)
    }
  }

  const handleAddNote = () => {
    toast.info('Note editor coming soon!')
  }

  return (
    <div className='sticky top-20 space-y-3'>
      <div className='space-y-2'>
        {/* Show Add to Review button only if not mastered */}
        {!isMastered && <AddToReviewButton type='word' itemId={word.id} />}

        <Button
          variant='secondary'
          className='w-full justify-start gap-2 text-sm'
          onClick={handleToggleMastered}
          disabled={isMarkingWord || isUnmarkingWord}
        >
          <CheckCheck size={15} />
          {isMarkingWord || isUnmarkingWord
            ? 'Processing...'
            : isMastered
              ? 'Unmark Mastered'
              : 'Mark as Mastered'}
        </Button>

        <Button
          variant='outline'
          className='w-full justify-start gap-2 text-sm'
          onClick={handleAddNote}
        >
          <StickyNote size={15} />
          Add Note
        </Button>
      </div>
    </div>
  )
}

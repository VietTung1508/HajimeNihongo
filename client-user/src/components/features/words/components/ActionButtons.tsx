'use client'

import {Button} from '@/components/ui/button'
import {BookmarkPlus, CheckCheck, StickyNote} from 'lucide-react'
import {toast} from 'sonner'

export function ActionButtons() {
  const handleAddToReviews = () => {
    toast.success(`added to your review list.`)
  }

  const handleMarkAsMastered = () => {
    toast.success(`marked as mastered.`)
  }

  const handleAddNote = () => {
    toast.info('Note editor coming soon!')
  }
  return (
    <div className='sticky top-20 space-y-3'>
      <div className='space-y-2'>
        <Button
          variant='default'
          className='w-full justify-start gap-2 text-sm'
          onClick={handleAddToReviews}
        >
          <BookmarkPlus size={15} />
          Add To Reviews
        </Button>

        <Button
          variant='secondary'
          className='w-full justify-start gap-2 text-sm'
          onClick={handleMarkAsMastered}
        >
          <CheckCheck size={15} />
          Mark as Mastered
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

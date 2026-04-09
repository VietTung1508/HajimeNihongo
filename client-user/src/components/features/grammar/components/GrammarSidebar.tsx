'use client'

import {toast} from 'sonner'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {BookmarkPlus, CheckCheck, StickyNote} from 'lucide-react'
import {GrammarDetail} from '../types'

interface GrammarSidebarProps {
  grammar: GrammarDetail
}

export function GrammarSidebar({grammar}: GrammarSidebarProps) {
  const handleAddToReviews = () => {
    toast.success(`"${grammar.grammarPoint}" added to your review list.`)
  }

  const handleMarkAsMastered = () => {
    toast.success(`"${grammar.grammarPoint}" marked as mastered.`)
  }

  const handleAddNote = () => {
    toast.info('Note editor coming soon!')
  }

  return (
    <div className='sticky top-20 space-y-3'>
      {/* Card */}
      <div className='rounded-lg border bg-card p-5 space-y-4'>
        <div>
          <h3 className='font-semibold text-lg'>{grammar.grammarPoint}</h3>
          <p className='text-sm text-muted-foreground mt-1'>
            {grammar.meaning}
          </p>
        </div>

        <div className='flex gap-2'>
          <Badge variant='secondary'>{grammar.level}</Badge>
          {grammar.lessonNumber && (
            <Badge variant='outline'>Lesson {grammar.lessonNumber}</Badge>
          )}
        </div>

        {grammar.meaningHint && (
          <div className='border-l-2 border-muted-foreground pl-3'>
            <p className='text-xs text-muted-foreground italic'>
              {grammar.meaningHint}
            </p>
          </div>
        )}
      </div>

      {/* Buttons below card */}
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

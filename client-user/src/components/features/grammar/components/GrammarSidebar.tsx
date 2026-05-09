'use client'

import {useState, useEffect} from 'react'
import {toast} from 'sonner'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {BookmarkPlus, CheckCheck, StickyNote} from 'lucide-react'
import {GrammarDetail} from '../types'
import {AddToReviewButton} from '@/components/features/review/components/AddToReviewButton'
import {useMasteredIds, useMarkAsMastered} from '@/components/features/review/hook/useReviewQueue'

interface GrammarSidebarProps {
  grammar: GrammarDetail
}

export function GrammarSidebar({grammar}: GrammarSidebarProps) {
  const {data: masteredIds} = useMasteredIds('grammar')
  const {markGrammar, unmarkGrammar, isMarkingGrammar, isUnmarkingGrammar} = useMarkAsMastered()

  const isMastered = masteredIds?.ids.includes(grammar.id) ?? false

  const handleToggleMastered = () => {
    if (isMastered) {
      unmarkGrammar([grammar.id])
      toast.success(`"${grammar.grammarPoint}" unmarked as mastered.`)
    } else {
      markGrammar([grammar.id])
      toast.success(`"${grammar.grammarPoint}" marked as mastered.`)
    }
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
        {/* Show Add to Review button only if not mastered */}
        {!isMastered && <AddToReviewButton type='grammar' itemId={grammar.id} />}

        <Button
          variant='secondary'
          className='w-full justify-start gap-2 text-sm'
          onClick={handleToggleMastered}
          disabled={isMarkingGrammar || isUnmarkingGrammar}
        >
          <CheckCheck size={15} />
          {isMarkingGrammar || isUnmarkingGrammar
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

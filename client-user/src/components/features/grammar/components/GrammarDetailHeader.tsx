'use client'

import {useState, useEffect} from 'react'
import {Bookmark, Share, Award} from 'lucide-react'
import {GrammarDetail} from '../types'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {useBookmark} from '@/features/bookmarks/hook/useBookmark'
import {AddToReviewButton} from '@/components/features/review/components/AddToReviewButton'
import {useMasteredIds, useMarkAsMastered} from '@/components/features/review/hook/useReviewQueue'

interface GrammarDetailHeaderProps {
  grammar: GrammarDetail
}

export function GrammarDetailHeader({grammar}: GrammarDetailHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const {useGetBookmarkedIds, toggleBookmark} = useBookmark({type: 'grammar'})
  const {data: bookmarkedIds} = useGetBookmarkedIds()
  const {data: masteredIds} = useMasteredIds('grammar')
  const {markGrammar, unmarkGrammar, isMarkingGrammar, isUnmarkingGrammar} = useMarkAsMastered()

  const isMastered = masteredIds?.ids.includes(grammar.id) ?? false

  useEffect(() => {
    if (bookmarkedIds) {
      setIsBookmarked(bookmarkedIds.includes(grammar.id))
    }
  }, [bookmarkedIds, grammar.id])

  const handleToggleBookmark = () => {
    const action = isBookmarked ? 'remove' : 'add'
    toggleBookmark.mutate(
      {id: grammar.id, action},
      {
        onSuccess: () => {
          setIsBookmarked(!isBookmarked)
        },
      },
    )
  }

  const handleToggleMastered = () => {
    if (isMastered) {
      unmarkGrammar([grammar.id])
    } else {
      markGrammar([grammar.id])
    }
  }

  return (
    <div className='space-y-2'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1 pt-2'>
          <p>Grammar Info</p>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>{grammar.level}</Badge>
            {grammar.lessonNumber != null && (
              <Badge variant='outline'>Lesson {grammar.lessonNumber}</Badge>
            )}
            {isMastered && (
              <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1'>
                <Award className='w-3 h-3' />
                Mastered
              </Badge>
            )}
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {/* Show Add to Review button only if not mastered */}
          {!isMastered && <AddToReviewButton type='grammar' itemId={grammar.id} />}
          {/* Mastered/Unmastered button */}
          <Button
            variant='outline'
            size='sm'
            onClick={handleToggleMastered}
            disabled={isMarkingGrammar || isUnmarkingGrammar}
            className={isMastered ? 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100' : ''}
          >
            {isMarkingGrammar || isUnmarkingGrammar
              ? 'Processing...'
              : isMastered
                ? 'Unmark Mastered'
                : 'Mark Mastered'}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleToggleBookmark}
          >
            <Bookmark
              className={isBookmarked ? 'fill-primary text-primary' : ''}
              size={20}
            />
          </Button>
          <Share size={20} />
        </div>
      </div>
      <div className='flex justify-center items-center h-50 mb-8'>
        <div className='space-y-2 flex flex-col items-center'>
          <h1 className='text-6xl font-bold tracking-tight text-[#c74a4a] [text-shadow:0_.125rem_.1875rem_#00000040]'>
            {grammar.grammarPoint}
          </h1>
          <p className='text-xl text-muted-foreground'>{grammar.meaning}</p>
        </div>
      </div>
    </div>
  )
}

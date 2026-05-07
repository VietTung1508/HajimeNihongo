'use client'

import {useState, useEffect} from 'react'
import {Bookmark, Share, Award} from 'lucide-react'
import {WordDetailDTO} from '../types'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {useBookmark} from '@/features/bookmarks/hook/useBookmark'
import {AddToReviewButton} from '@/components/features/review/components/AddToReviewButton'
import {useMasteredIds, useMarkAsMastered} from '@/components/features/review/hook/useReviewQueue'

interface WordDetailHeaderProps {
  word: WordDetailDTO
}

export function WordDetailHeader({word}: WordDetailHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const {useGetBookmarkedIds, toggleBookmark} = useBookmark({type: 'word'})
  const {data: bookmarkedIds} = useGetBookmarkedIds()
  const {data: masteredIds} = useMasteredIds('word')
  const {markWord, unmarkWord, isMarkingWord, isUnmarkingWord} = useMarkAsMastered()

  const isMastered = masteredIds?.ids.includes(word.id) ?? false

  useEffect(() => {
    if (bookmarkedIds) {
      setIsBookmarked(bookmarkedIds.includes(word.id))
    }
  }, [bookmarkedIds, word.id])

  const handleToggleBookmark = () => {
    const action = isBookmarked ? 'remove' : 'add'
    toggleBookmark.mutate(
      {id: word.id, action},
      {
        onSuccess: () => {
          setIsBookmarked(!isBookmarked)
        },
      },
    )
  }

  const handleToggleMastered = () => {
    if (isMastered) {
      unmarkWord([word.id])
    } else {
      markWord([word.id])
    }
  }

  const titleDisplay = word.kanji ? word.kanji : word.reading
  const meaningsText = word.meanings.map((m) => m.text).join(', ')

  return (
    <div className='space-y-2'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1 pt-2'>
          <p>Vocab Info</p>
          <div className='flex items-center gap-2'>
            {word.isCommon ? (
              <Badge className='bg-green-100 text-black'>Common</Badge>
            ) : (
              <Badge variant='outline'>Uncommon</Badge>
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
          {!isMastered && <AddToReviewButton type='word' itemId={word.id} />}
          {/* Mastered/Unmastered button */}
          <Button
            variant='outline'
            size='sm'
            onClick={handleToggleMastered}
            disabled={isMarkingWord || isUnmarkingWord}
            className={isMastered ? 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100' : ''}
          >
            {isMarkingWord || isUnmarkingWord
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
        <div className='flex flex-col items-center text-center'>
          {word.kanji && (
            <span className='text-3xl font-bold tracking-tight text-[#c74a4a] [text-shadow:0_.125rem_.1875rem_#00000040] '>
              {word.reading}
            </span>
          )}
          <h1 className='text-6xl font-bold tracking-tight text-[#c74a4a] [text-shadow:0_.125rem_.1875rem_#00000040] whitespace-pre-line'>
            {titleDisplay}
          </h1>
          <p className='text-xl text-muted-foreground mt-3'>{meaningsText}</p>
        </div>
      </div>
    </div>
  )
}

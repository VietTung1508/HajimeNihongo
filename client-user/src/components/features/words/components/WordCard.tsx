'use client'

import {useRouter} from 'next/navigation'
import {Bookmark, Award} from 'lucide-react'
import {WordDTO} from '../types'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'
import {WordCardDotMenu} from './WordCardDotMenu'

interface WordCardProps {
  word: WordDTO
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelect: (id: number) => void
  isBookmarked?: boolean
  onToggleBookmark?: () => void
  isMastered?: boolean
}

const JLPT_LABELS: Record<number, string> = {
  5: 'N5',
  4: 'N4',
  3: 'N3',
  2: 'N2',
  1: 'N1',
}

export function WordCard({
  word,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  isBookmarked,
  onToggleBookmark,
  isMastered,
}: WordCardProps) {
  const router = useRouter()

  const headerLabel = word.kanji
    ? `${word.kanji}・${word.reading}`
    : word.reading

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect(word.id)
    } else {
      router.push(`/vocabulary/${word.id}`)
    }
  }

  const handleDotClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Card
      className={`cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
      onClick={handleCardClick}
    >
      <CardContent>
        {/* Top row: kanji + reading, dot menu */}
        <div className='flex items-center justify-between gap-2 mb-2'>
          <div className='flex items-center gap-2'>
            {isSelectionMode && (
              <span
                className={`w-4 h-4 rounded border flex-shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
              />
            )}
            <span className='font-semibold text-base'>{headerLabel}</span>
          </div>
          <div className='flex items-center gap-1'>
            {isBookmarked !== undefined && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleBookmark?.()
                }}
                className="flex-shrink-0"
              >
                <Bookmark
                  className={isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}
                  size={18}
                />
              </button>
            )}
            <div onClick={handleDotClick}>
              <WordCardDotMenu wordId={word.id} wordLabel={headerLabel} isBookmarked={!!isBookmarked} />
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1 justify-start  mb-3'>
          {word.jlptLevel != null && (
            <Badge variant='secondary' className='text-xs'>
              {JLPT_LABELS[word.jlptLevel] ?? `N${word.jlptLevel}`}
            </Badge>
          )}
          {word.isCommon && (
            <Badge variant='outline' className='text-xs bg-green-100'>
              Common
            </Badge>
          )}
          {isMastered && (
            <Badge variant='outline' className='text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700 flex items-center gap-1'>
              <Award className='w-3 h-3' />
              Mastered
            </Badge>
          )}
        </div>

        {/* Meanings */}
        <p className='text-sm text-muted-foreground line-clamp-2'>
          {word.meanings.join(', ')}
        </p>
      </CardContent>
    </Card>
  )
}

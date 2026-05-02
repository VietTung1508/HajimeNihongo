'use client'

import {useRouter} from 'next/navigation'
import {Bookmark} from 'lucide-react'
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
              <WordCardDotMenu wordId={word.id} isBookmarked={!!isBookmarked} />
            </div>
          </div>
        </div>

        {/* Meanings */}
        <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
          {word.meanings.join(', ')}
        </p>

        <div className='flex items-center gap-1 justify-start'>
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
        </div>
      </CardContent>
    </Card>
  )
}

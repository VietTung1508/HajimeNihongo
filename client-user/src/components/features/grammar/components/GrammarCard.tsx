'use client'

import {useRouter} from 'next/navigation'
import {isKanji, toHiragana} from 'wanakana'
import {Bookmark, Award} from 'lucide-react'
import {GrammarItem} from '../types'
import {GrammarCardDotMenu} from './GrammarCardDotMenu'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'

interface GrammarCardProps {
  grammar: GrammarItem
  index: number
  total: number
  isBookmarked?: boolean
  onToggleBookmark?: () => void
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: number) => void
  isMastered?: boolean
}

export function GrammarCard({
  grammar,
  index,
  total,
  isBookmarked,
  onToggleBookmark,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  isMastered,
}: GrammarCardProps) {
  const router = useRouter()

  const lessonLabel =
    grammar.lessonNumber != null
      ? `Lesson ${grammar.lessonNumber}: ${index + 1}/${total} `
      : null

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect?.(grammar.id)
    } else {
      router.push(`/grammar/${grammar.id}`)
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-colors py-2 ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
      onClick={handleCardClick}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-2 mb-1'>
          <div className='flex items-center gap-2'>
            {isSelectionMode && (
              <span
                className={`w-4 h-4 rounded border flex-shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
              />
            )}
            <span className='font-semibold text-base'>
              {grammar.grammarPoint}
            </span>
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
            <div onClick={(e) => e.stopPropagation()}>
              <GrammarCardDotMenu grammarId={grammar.id} isBookmarked={!!isBookmarked} />
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1 mb-2'>
          <Badge variant='secondary' className='text-xs'>
            {grammar.level}
          </Badge>
          {lessonLabel && (
            <Badge variant='outline' className='text-xs'>
              {lessonLabel}
            </Badge>
          )}
          {isMastered && (
            <Badge variant='outline' className='text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700 flex items-center gap-1'>
              <Award className='w-3 h-3' />
              Mastered
            </Badge>
          )}
        </div>

        {/* Meaning */}
        <p className='text-sm text-muted-foreground line-clamp-1'>
          {grammar.meaning}
        </p>
      </CardContent>
    </Card>
  )
}

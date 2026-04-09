'use client'

import {useRouter} from 'next/navigation'
import {isKanji, toHiragana} from 'wanakana'
import {GrammarItem} from '../types'
import {GrammarSettingsPopup} from './GrammarSettingsPopup'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent} from '@/components/ui/card'

interface GrammarCardProps {
  grammar: GrammarItem
  index: number
  total: number
}

export function GrammarCard({grammar, index, total}: GrammarCardProps) {
  const router = useRouter()


  const lessonLabel = grammar.lessonNumber != null ? `Lesson ${grammar.lessonNumber}: ${index + 1}/${total} ` : null

  return (
    <Card
      className='cursor-pointer hover:border-primary/50 transition-colors'
      onClick={() => router.push(`/grammar/${grammar.id}`)}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-2 mb-1'>
          <div className='flex flex-col'>
            <span className='font-semibold text-base'>{grammar.grammarPoint}</span>
          </div>
          <div onClick={e => e.stopPropagation()}>
            <GrammarSettingsPopup grammarId={grammar.id} />
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
        </div>

        {/* Meaning */}
        <p className='text-sm text-muted-foreground line-clamp-1'>
          {grammar.meaning}
        </p>
      </CardContent>
    </Card>
  )
}

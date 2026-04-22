'use client'

import {Bookmark, Share} from 'lucide-react'
import {WordDetailDTO} from '../types'
import {Badge} from '@/components/ui/badge'

interface WordDetailHeaderProps {
  word: WordDetailDTO
}

export function WordDetailHeader({word}: WordDetailHeaderProps) {
  const titleDisplay = word.kanji ? word.kanji : word.reading

  const meaningsText = word.meanings.map((m) => m.text).join(', ')

  return (
    <div className='space-y-2'>
      {/* Top Bar */}
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1 pt-2'>
          <p>Vocab Info</p>
          <div>
            {word.isCommon ? (
              <Badge className='bg-green-100 text-black'>Common</Badge>
            ) : (
              <Badge variant='outline'>Uncommon</Badge>
            )}
          </div>
        </div>
        <div className='flex items-center gap-5'>
          <Bookmark />
          <Share />
        </div>
      </div>

      {/* Centered Title Section */}
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

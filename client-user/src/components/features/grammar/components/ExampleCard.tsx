'use client'

import {Volume2} from 'lucide-react'
import {GrammarExample} from '../types'

interface ExampleCardProps {
  example: GrammarExample
}

export function ExampleCard({example}: ExampleCardProps) {
  return (
    <div className='rounded-lg border bg-card p-4 space-y-1'>
      <div className='flex items-start justify-between gap-2'>
        <p className='text-base leading-relaxed'>{example.sentence}</p>
        {example.audioUrl && (
          <Volume2 className='w-4 h-4 text-muted-foreground shrink-0 mt-0.5' />
        )}
      </div>
      <p className='text-sm text-muted-foreground'>{example.translation}</p>
    </div>
  )
}

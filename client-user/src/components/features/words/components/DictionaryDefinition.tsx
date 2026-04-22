'use client'

import {WordDetailDTO} from '../types'

interface DictionaryDefinitionProps {
  word: WordDetailDTO
}

export function DictionaryDefinition({word}: DictionaryDefinitionProps) {
  return (
    <section className='space-y-4 mb-8'>
      {/* Meanings List */}
      <div className='space-y-2'>
        <ol className='list-decimal list-inside space-y-1'>
          {word.meanings.map((meaning) => (
            <li key={meaning.id} className='text-muted-foreground'>
              {meaning.text}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

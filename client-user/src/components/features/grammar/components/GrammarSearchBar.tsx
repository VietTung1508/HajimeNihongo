'use client'

import {useState, useEffect} from 'react'
import {Search, X} from 'lucide-react'
import {Input} from '@/components/ui/input'

interface GrammarSearchBarProps {
  onSearch: (q: string) => void
  placeholder?: string
}

export function GrammarSearchBar({
  onSearch,
  placeholder = 'Search grammar...',
}: GrammarSearchBarProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value)
    }, 300)
    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className='pl-9 pr-9'
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  )
}

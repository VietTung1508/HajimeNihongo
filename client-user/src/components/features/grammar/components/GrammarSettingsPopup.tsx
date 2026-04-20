'use client'

import {useState, useRef, useEffect} from 'react'
import {Settings} from 'lucide-react'
import {cn} from '@/lib/utils'

interface GrammarSettingsPopupProps {
  grammarId: number
}

export function GrammarSettingsPopup({grammarId}: GrammarSettingsPopupProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground',
          open && 'bg-muted',
        )}
        aria-label='Grammar settings'
      >
        <Settings className='w-4 h-4' />
      </button>
      {open && (
        <div className='absolute right-0 top-full mt-1 z-50 bg-background border rounded-lg shadow-lg min-w-[160px] p-1'>
          {/* Features to be defined later */}
        </div>
      )}
    </div>
  )
}

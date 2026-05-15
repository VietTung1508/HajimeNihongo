'use client'

import {Lock} from 'lucide-react'

interface LockedBadgeProps {
  size?: number
  className?: string
}

export function LockedBadge({size = 16, className = ''}: LockedBadgeProps) {
  return (
    <Lock
      size={size}
      className={`${className} text-slate-400`}
      aria-label="Locked - Complete previous level first"
    />
  )
}

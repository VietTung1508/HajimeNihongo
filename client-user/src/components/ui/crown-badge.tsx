'use client'

import {Crown} from 'lucide-react'

interface CrownBadgeProps {
  size?: number
  className?: string
}

export function CrownBadge({size = 16, className = ''}: CrownBadgeProps) {
  return (
    <Crown
      size={size}
      className={`${className} text-amber-500 fill-amber-500`}
      aria-label="Mastered Level"
    />
  )
}

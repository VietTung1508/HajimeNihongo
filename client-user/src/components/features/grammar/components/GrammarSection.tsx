'use client'

import {ReactNode} from 'react'

interface GrammarSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function GrammarSection({
  title,
  children,
  className = '',
}: GrammarSectionProps) {
  return (
    <section className={`space-y-3 ${className}`}>
      <h2 className='text-lg font-semibold'>{title}</h2>
      <div>{children}</div>
    </section>
  )
}

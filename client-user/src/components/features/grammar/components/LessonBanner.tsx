'use client'

import { BookCheck } from 'lucide-react'
import {useEffect, useRef, useState} from 'react'

interface LessonBannerProps {
  lessonNumber: string
  lessonTitle: string | undefined | null
}

export function LessonBanner({lessonNumber, lessonTitle}: LessonBannerProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {threshold: 0.1},
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border border-border/60 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className='absolute inset-0 bg-linear-to-br from-(--primary)/5 via-transparent to-(--accent)/10' />
      <div className='absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-primary via-(--primary)/60 to-transparent rounded-l-2xl' />

      <div
        className='absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className='relative px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='flex items-center gap-4'>
          <div className='shrink-0'>
            <div className='w-10 h-10 rounded-xl bg-(--primary)/10 border border-(--primary)/20 flex items-center justify-center'>
              <span className='font-mono font-bold text-base text-primary'>
                {lessonNumber}
              </span>
            </div>
          </div>
          <div>
            <p className='text-xs font-medium text-muted-foreground tracking-widest uppercase'>
              Lesson
            </p>
            <h2 className='text-lg font-semibold leading-tight'>
              {lessonTitle ?? 'Untitled Lesson'}
            </h2>
          </div>
        </div>

        {/* Right — count badge */}
        <div className='self-start'>
          <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground border border-border/50'>
            <BookCheck width={13} height={13}/>
            <span className='text-muted-foreground'>Unit</span>
            <span className='font-semibold'>{lessonNumber}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
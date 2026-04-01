'use client'

import {useEffect, useState} from 'react'

export function useScrollSpy(sectionIds: (string | number)[]) {
  const [activeId, setActiveId] = useState<string | number | null>(
    sectionIds[0] ?? null,
  )

  useEffect(() => {
    if (sectionIds.length === 0) return

    const findTopmost = (entries: IntersectionObserverEntry[]) => {
      let topmost: IntersectionObserverEntry | null = null
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (
            !topmost ||
            entry.boundingClientRect.top < topmost.boundingClientRect.top
          ) {
            topmost = entry
          }
        }
      }
      return topmost
    }

    let currentTopmost: IntersectionObserverEntry | null = null

    const observer = new IntersectionObserver(
      entries => {
        currentTopmost = findTopmost(entries) ?? currentTopmost
        if (currentTopmost) {
          setActiveId(String(currentTopmost.target.id))
        }
      },
      {rootMargin: '-40px 0px 0% 0px', threshold: 0},
    )

    sectionIds.forEach(id => {
      const el = document.getElementById(String(id))
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sectionIds])

  return activeId
}

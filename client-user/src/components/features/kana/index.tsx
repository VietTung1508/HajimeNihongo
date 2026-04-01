'use client'

import {useState} from 'react'
import {useKanaSections} from './hook/useKanaSections'
import {KanaSidebar} from './components/KanaSidebar'
import {KanaContent} from './components/KanaContent'
import {KanaLoading} from './components/KanaLoading'
import {KanaSectionsResponse} from './types'
import Container from '@/components/layout/Container'

export function KanaMain() {
  const {data, isLoading, isError} = useKanaSections()
  const [openItems, setOpenItems] = useState<string[]>(['hiragana'])
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null,)

  if (isLoading) return <KanaLoading />
  if (isError || !data) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-muted-foreground'>Failed to load kana content.</p>
      </div>
    )
  }

  const openSection = (sections: KanaSectionsResponse, sectionId: number) => {
    const section = [...sections.hiragana, ...sections.katakana].find(
      s => s.id === sectionId,
    )
    if (!section) return

    // Set active immediately (before scroll spy catches up)
    setActiveSectionId(sectionId)

    setOpenItems(prev => {
      const next = new Set(prev)
      next.add(section.type)
      next.add(String(sectionId))
      return [...next]
    })

    // Scroll after accordion has had a tick to open
    setTimeout(() => {
      const trigger = document.querySelector(
        `[data-section-header="${sectionId}"]`,
      )
      if (trigger) {
        const top = trigger.getBoundingClientRect().top + window.scrollY - 40
        window.scrollTo({top, behavior: 'smooth'})
      }
    }, 80)
  }

  return (
    <Container>
    <div className='flex min-h-[calc(100vh-64px)]'>
      <KanaSidebar
        sections={data}
        activeSectionId={activeSectionId}
        onSectionClick={id => openSection(data, id)}
      />
      <main className='flex-1 overflow-y-auto px-8 pb-6 max-w-4xl'>
        <KanaContent
          sections={data}
          openItems={openItems}
          onOpenChange={setOpenItems}
        />
      </main>
    </div>
    </Container>
  )
}

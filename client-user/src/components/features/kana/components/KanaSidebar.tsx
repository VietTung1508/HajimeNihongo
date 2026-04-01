'use client'

import {KanaSectionsResponse} from '../types'
import {useScrollSpy} from '../hook/useScrollSpy'

interface KanaSidebarProps {
  sections: KanaSectionsResponse
  activeSectionId: number | null
  onSectionClick: (id: number) => void
}

export function KanaSidebar({
  sections,
  activeSectionId,
  onSectionClick,
}: KanaSidebarProps) {
  const allIds = [
    ...sections.hiragana.map(s => s.id),
    ...sections.katakana.map(s => s.id),
  ]
  console.log(allIds)
  // Use scroll spy as fallback; activeSectionId prop takes priority
  const scrollSpyId = useScrollSpy(allIds)
  const effectiveActiveId = activeSectionId ?? scrollSpyId

  const renderSectionItem = (id: number, title: string) => {
    const isActive = effectiveActiveId === id
    return (
      <button
        key={id}
        onClick={() => onSectionClick(id)}
        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
          isActive
            ? 'bg-[#c74a4a] text-white'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        {title}
      </button>
    )
  }

  return (
    <aside className='w-60 shrink-0 border-r bg-background h-[calc(100vh-64px)] sticky top-16 overflow-y-auto'>
      <div className='p-4 pl-0 space-y-6'>
        {/* Hiragana group */}
        <div>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3'>
            Hiragana
          </p>
          <nav className='space-y-1'>
            {sections.hiragana.map(section =>
              renderSectionItem(section.id, section.title),
            )}
          </nav>
        </div>

        {/* Katakana group */}
        <div>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3'>
            Katakana
          </p>
          <nav className='space-y-1'>
            {sections.katakana.map(section =>
              renderSectionItem(section.id, section.title),
            )}
          </nav>
        </div>
      </div>
    </aside>
  )
}

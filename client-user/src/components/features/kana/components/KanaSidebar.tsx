'use client'

import {KanaSectionsResponse} from '../types'

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

  const renderSectionItem = (id: number, title: string) => {
    const isActive = activeSectionId === id
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
    <aside className='w-60 shrink-0 bg-background h-full sticky top-14 overflow-y-auto border border-gray-300 rounded-md'>
      <div className='p-4 space-y-6'>
        {/* Hiragana group */}
        <div>
          <p className='text-xs font-bold text-black uppercase tracking-wider mb-2 px-3'>
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
          <p className='text-xs font-bold text-black uppercase tracking-wider mb-2 px-3'>
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

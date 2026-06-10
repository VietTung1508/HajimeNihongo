import {useEffect, useState} from 'react'
import {closestCenter, DndContext} from '@dnd-kit/core'
import type {DragEndEvent} from '@dnd-kit/core'
import {arrayMove, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {useLandingData, useUpdateSectionPositions} from './hooks/use-landing-api'
import {DraggableSectionCard} from './components/draggable-section-card'
import {HeroSectionForm} from './components/hero-section-form'
import {TestimonialsSection} from './components/testimonials-section'
import {ChatbotSectionForm} from './components/chatbot-section-form'
import {CtaSectionForm} from './components/cta-section-form'
import type {LandingSection} from './types'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  testimonials: 'Testimonials',
  chatbot: 'AI Chatbot',
  cta: 'CTA Section',
}

const Landing = () => {
  const {data, isLoading} = useLandingData()
  const updatePositions = useUpdateSectionPositions()
  const [sections, setSections] = useState<LandingSection[]>([])
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (data?.sections) setSections(data.sections)
  }, [data])

  const toggleSection = (key: string) =>
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const closeSection = (key: string) =>
    setOpenSections(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex(s => s.sectionKey === active.id)
    const newIdx = sections.findIndex(s => s.sectionKey === over.id)
    const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({...s, position: i}))
    setSections(reordered)
    updatePositions.mutate(reordered.map(s => ({sectionKey: s.sectionKey, position: s.position})))
  }

  if (isLoading) return <div className='p-6 text-muted-foreground'>Loading...</div>

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Landing Page</h1>
        <p className='text-sm text-muted-foreground'>
          Drag sections to reorder. Expand a section to edit. Changes save immediately.
        </p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sections.map(s => s.sectionKey)}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex flex-col gap-4'>
            {sections.map(section => (
              <DraggableSectionCard
                key={section.sectionKey}
                id={section.sectionKey}
                title={SECTION_LABELS[section.sectionKey]}
                open={openSections.has(section.sectionKey)}
                onToggle={() => toggleSection(section.sectionKey)}
              >
                {section.sectionKey === 'hero' && (
                  <HeroSectionForm section={section} onClose={() => closeSection('hero')} />
                )}
                {section.sectionKey === 'testimonials' && (
                  <TestimonialsSection section={section} />
                )}
                {section.sectionKey === 'chatbot' && (
                  <ChatbotSectionForm section={section} onClose={() => closeSection('chatbot')} />
                )}
                {section.sectionKey === 'cta' && (
                  <CtaSectionForm section={section} onClose={() => closeSection('cta')} />
                )}
              </DraggableSectionCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default Landing

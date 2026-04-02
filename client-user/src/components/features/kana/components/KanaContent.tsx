'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {KanaAccordion} from './KanaAccordion'
import {KanaSectionsResponse} from '../types'

interface KanaContentProps {
  sections: KanaSectionsResponse
  openItems: string[]
  onOpenChange: (items: string[]) => void
}

export function KanaContent({
  sections,
  openItems,
  onOpenChange,
}: KanaContentProps) {
  return (
    <Accordion
      type='multiple'
      value={openItems}
      onValueChange={onOpenChange}
      className='w-full'
    >
      {/* Hiragana top-level accordion */}
      <AccordionItem value='hiragana'>
        <AccordionTrigger className='text-xl font-bold hover:no-underline py-4'>
          Hiragana
        </AccordionTrigger>
        <AccordionContent>
          <Accordion
            type='multiple'
            value={openItems}
            onValueChange={onOpenChange}
            className='w-full'
          >
            {sections.hiragana.map(section => (
              <KanaAccordion
                key={section.id}
                id={section.id}
                title={section.title}
                content={section.content}
              />
            ))}
          </Accordion>
        </AccordionContent>
      </AccordionItem>

      {/* Katakana top-level accordion */}
      <AccordionItem value='katakana'>
        <AccordionTrigger className='text-xl font-bold hover:no-underline py-4'>
          Katakana
        </AccordionTrigger>
        <AccordionContent>
          <Accordion
            type='multiple'
            value={openItems}
            onValueChange={onOpenChange}
            className='w-full'
          >
            {sections.katakana.map(section => (
              <KanaAccordion
                key={section.id}
                id={section.id}
                title={section.title}
                content={section.content}
              />
            ))}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

'use client'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface KanaAccordionProps {
  id: number
  title: string
  content: string
}

export function KanaAccordion({id, title, content}: KanaAccordionProps) {
  return (
    <AccordionItem value={String(id)} id={String(id)}>
      <AccordionTrigger
        data-section-header={String(id)}
        className='text-base font-medium hover:no-underline'
      >
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div
          className='prose prose-sm max-w-none'
          dangerouslySetInnerHTML={{__html: content}}
        />
      </AccordionContent>
    </AccordionItem>
  )
}

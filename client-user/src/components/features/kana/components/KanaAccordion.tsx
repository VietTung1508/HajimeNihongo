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
    // id={id} enables getElementById() in useScrollSpy to track which section is in view
    <AccordionItem value={String(id)} id={String(id)}>
      <AccordionTrigger
        // data-section-header is the scroll target — scrolling lands on the header, not content
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

import AppLayout from '@/components/layout/AppLayout'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {fetchLandingData} from '@/lib/landing-api'
import HeroLanding from '@/components/sections/HeroLanding'
import Testimonials from '@/components/sections/Testimonials'
import AIChatbot from '@/components/sections/AIChatbot'
import CTA from '@/components/sections/CTA'
import {HeroContent, ChatbotContent, CtaContent} from '@/types/landing'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')
  if (token) redirect('/dashboard')

  const {sections} = await fetchLandingData()

  return (
    <AppLayout>
      {sections.map(section => {
        switch (section.sectionKey) {
          case 'hero':
            return <HeroLanding key="hero" content={section.content as HeroContent} />
          case 'testimonials':
            return <Testimonials key="testimonials" items={section.items ?? []} />
          case 'chatbot':
            return <AIChatbot key="chatbot" content={section.content as ChatbotContent} />
          case 'cta':
            return <CTA key="cta" content={section.content as CtaContent} />
          default:
            return null
        }
      })}
    </AppLayout>
  )
}

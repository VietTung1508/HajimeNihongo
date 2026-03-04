import AppLayout from '@/components/layout/AppLayout'
import CTA from '@/components/sections/CTA'
import HeroLanding from '@/components/sections/HeroLanding'
import Pricing from '@/components/sections/Pricing'
import Testimonials from '@/components/sections/Testimonials'

export default function Home() {
  return (
    <AppLayout>
      <HeroLanding />
      <Pricing />
      <Testimonials />
      <CTA />
    </AppLayout>
  )
}

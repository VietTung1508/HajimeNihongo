import AppLayout from '@/components/layout/AppLayout'
import CTA from '@/components/sections/CTA'
import HeroLanding from '@/components/sections/HeroLanding'
import Pricing from '@/components/sections/Pricing'
import Testimonials from '@/components/sections/Testimonials'
import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')

  if (token) {
    redirect('/dashboard')
  }
  return (
    <AppLayout>
      <HeroLanding />
      <Pricing />
      <Testimonials />
      <CTA />
    </AppLayout>
  )
}

'use client'

import Container from '@/components/layout/Container'
import {Switch} from '@/components/ui/switch'
import {Pricing as PricingType} from './types'
import PricingCard from './components/PricingCard'
import {useState} from 'react'

const PricingList: PricingType[] = [
  {
    pricingTitle: 'Free',
    desc: 'Limited access to HajimeNihongo. View Grammar and Vocab pages, along with Reading Passages and other learning tools.',
    price: 0,
    priceSuffix: 'Free Forever!',
  },
  {
    pricingTitle: 'Premium',
    desc: 'Complete access to Bunpro With AI chat bot features that help you with your learning',
    price: 5,
    yearPrice: 50,
    priceSuffix: 'Test the waters! Pay as you go.',
  },
  {
    pricingTitle: 'Lifetime',
    desc: 'Complete access to Bunpro, for the entire Lifetime of the app.',
    price: 100,
    priceSuffix: 'One-time payment',
    isSpecialOffer: true,
  },
]

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false)
  return (
    <Container className='py-20'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-xl'>Our Pricing</h2>
        <div className='flex items-center gap-2 border-gray-300 border p-1 px-2 rounded-md'>
          <p className={!isYearly ? 'text-[#C74A4A]' : ''}>Monthly</p>
          <Switch
            checked={isYearly}
            onCheckedChange={(checked) => setIsYearly(checked)}
            className='data-[state=checked]:bg-[#C74A4A]'
          />
          <p className={isYearly ? 'text-[#C74A4A]' : ''}>Yearly</p>
        </div>
      </div>
      <div className='flex gap-5 items-center'>
        {PricingList.map((pricing, idx) => (
          <PricingCard item={pricing} key={idx} isYearly={isYearly} />
        ))}
      </div>
    </Container>
  )
}

export default Pricing

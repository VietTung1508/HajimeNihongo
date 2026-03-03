import React from 'react'
import {Pricing} from '../types'
import {DollarSign} from 'lucide-react'

interface PricingCardProps {
  item: Pricing
  isYearly: boolean
}

const PricingCard: React.FC<PricingCardProps> = ({item, isYearly = false}) => {
  return (
    <div
      className={`flex-1 p-4 border border-gray-400 rounded-md flex flex-col items-start justify-start ${item.isSpecialOffer ? 'bg-[#082630]' : ''}`}
    >
      <h2
        className={`text-[22px] font-semibold mb-1 ${item.isSpecialOffer ? 'text-white' : 'text-[#404040]'}`}
      >
        {item.pricingTitle}
      </h2>
      <p
        className={`text-base min-h-20 ${item.isSpecialOffer ? 'text-[#9FA9AD]' : 'text-[#6D6D6D]'}`}
      >
        {item.desc}
      </p>

      <div className='relative'>
        <DollarSign
          className={`absolute left-0 top-5 w-3 h-3  ${item.isSpecialOffer ? 'text-white' : 'text-[#404040]'}`}
        />
        <div className='flex flex-col'>
          <div className='flex items-end gap-1'>
            <h2
              className={`pl-3 font-semibold text-[49px] ${item.isSpecialOffer ? 'text-white' : 'text-black'}`}
            >
              {isYearly ? (item.yearPrice ?? item.price) : item.price}{' '}
            </h2>
            <span className='font-normal text-base text-[#9FA9AD] pb-2'>
              USD
            </span>
          </div>
          <p className='text-base text-[#9FA9AD] -mt-2'>{item.priceSuffix}</p>
        </div>
      </div>
    </div>
  )
}

export default PricingCard

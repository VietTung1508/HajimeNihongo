import Image from 'next/image'
import React from 'react'
import {Testimonial} from '../types'

interface TestimonialCardProps {
  isReverse: boolean
  testimonial: Testimonial
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  isReverse,
  testimonial,
}) => {
  return (
    <div
      className={`flex gap-16 items-center ${isReverse ? 'flex-row-reverse' : ''}`}
    >
      <Image
        width={160}
        height={160}
        src={testimonial.avatar}
        alt='avatar'
        className='rounded-xl object-cover'
      />
      <div className='flex-3 flex flex-col justify-start'>
        <p className='text-2xl text-white'>"{testimonial.content}"</p>
        <h3 className='text-xl text-[#F4726D] mt-5 mb-2'>{testimonial.name}</h3>
        <p className='text-lg text-[#9FA9AD]'>{testimonial.userTitle}</p>
      </div>
    </div>
  )
}

export default TestimonialCard

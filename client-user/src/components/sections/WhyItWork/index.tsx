import Container from '@/components/layout/Container'
import Image from 'next/image'
import React from 'react'

const whyItWorksData = [
  {
    title: 'Understand Japanese with AI Chat Support You',
    desc: 'Ask anything about grammar, sentence structure, or word meaning. Our interactive chatbox explains Japanese clearly and naturally, just like a personal tutor.',
    icon: '/assets/landing-page/book.png',
  },
  {
    title: 'Master Kanji and Vocabulary Step by Step With Ease',
    desc: 'Learn kanji readings, meanings, and usage alongside essential vocabulary. Build a strong foundation that helps you read and understand Japanese confidently.',
    icon: '/assets/landing-page/hills.png',
  },
  {
    title: 'Track Your Learning Progress',
    desc: 'Stay motivated with structured lessons and visible progress tracking. See how far you’ve come and keep moving forward with a clear learning path.',
    icon: '/assets/landing-page/feedbacks.png',
  },
]

const WhyItWork = () => {
  return (
    <div className='bg-[#082530]'>
      <Container className='pt-10 pb-32'>
        <h2 className='text-[28px] pb-2 text-white'>Why it works</h2>
        <div className='flex items-center gap-4'>
          {whyItWorksData.map((item) => (
            <div
              key={item.title}
              className='bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 min-h-83.5'
            >
              <Image width={144} height={144} src={item.icon} alt={item.icon} />
              <div className='space-y-2'>
                <h3 className='font-semibold text-2xl text-center'>
                  {item.title}
                </h3>
                <p className='text-sm text-center'>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default WhyItWork

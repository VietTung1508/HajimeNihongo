import Container from '@/components/layout/Container'
import {Button} from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

const CTA = () => {
  return (
    <Container className='flex flex-col items-center justify-center'>
      <Image
        src='/assets/landing-page/marketing.png'
        alt='cta_image'
        width={800}
        height={800}
        className='object-cover'
      />
      <p className='text-[19px] mb-2'>Ready to jump in with us?</p>
      <Button>Try HajimeNihongo</Button>
    </Container>
  )
}

export default CTA

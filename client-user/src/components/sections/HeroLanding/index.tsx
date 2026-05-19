'use client'

import {Button} from '@/components/ui/button'
import {TypeAnimation} from 'react-type-animation'
import WhyItWork from '../WhyItWork'
import Container from '@/components/layout/Container'
import {HeroContent} from '@/types/landing'

interface Props {
  content: HeroContent | null
}

const DEFAULT: HeroContent = {
  headline: 'Japanese is complex.\nWe make it simple.',
  subheadline: 'Hajime Nihongo gives you the roadmap and tools you need to attain your learning goals',
  ctaLabel: 'Try HajimeNihongo',
  imageUrl: '/assets/landing-page/landing_hero.png',
}

const HeroLanding = ({content}: Props) => {
  const {headline, subheadline, ctaLabel, imageUrl} = content ?? DEFAULT
  return (
    <div>
      <div
        className="h-screen bg-cover bg-center bg-no-repeat"
        style={{backgroundImage: `url('${imageUrl}')`}}
      >
        <Container>
          <div className='pl-6 h-screen flex items-center justify-start'>
            <div className='flex flex-col gap-3'>
              <TypeAnimation
                sequence={headline.split('\n').flatMap(line => [line, 1000])}
                speed={50}
                repeat={Infinity}
                style={{whiteSpace: 'pre-line'}}
                className='text-[60px] leading-[1.1] text-white font-bold'
              />
              <p className='text-white text-[19px] max-w-104.5'>{subheadline}</p>
              <div className='flex items-center gap-3'>
                <Button>{ctaLabel}</Button>
                <Button className='bg-white text-black px-15'>Login</Button>
              </div>
            </div>
            <div />
          </div>
        </Container>
      </div>
      <WhyItWork features={content?.features} />
    </div>
  )
}

export default HeroLanding

'use client'

import {Button} from '@/components/ui/button'
import {TypeAnimation} from 'react-type-animation'
import WhyItWork from '../WhyItWork'
import Container from '@/components/layout/Container'

const HeroLanding = () => {
  return (
    <div>
      <div className="h-screen bg-[url('/assets/landing-page/landing_hero.png')] bg-cover bg-center bg-no-repeat">
        <Container>
          <div className='pl-6 h-screen flex items-center justify-start'>
            <div className='flex flex-col gap-3'>
              <TypeAnimation
                sequence={[
                  'Japanese is complex. \n We makes it simple.',
                  1000,
                  'Master JLPT step by step',
                  1000,
                  'Start Learning today!',
                  1000,
                ]}
                speed={50}
                repeat={Infinity}
                style={{whiteSpace: 'pre-line'}}
                className='text-[60px] leading-[1.1] text-white font-bold'
              />
              <p className='text-white text-[19px] max-w-104.5'>
                Hajime Nihongo gives you the roadmap and tools you need to
                attain your learning goals
              </p>
              <div className='flex items-center gap-3'>
                <Button>Try HajimeNihongo</Button>
                <Button className='bg-white text-black px-15'>Login</Button>
              </div>
            </div>
            <div />
          </div>
        </Container>
      </div>
      <WhyItWork />
    </div>
  )
}

export default HeroLanding

import Container from '@/components/layout/Container'
import {Button} from '@/components/ui/button'
import {Separator} from '@/components/ui/separator'
import {ArrowRight} from 'lucide-react'
import {Dispatch, SetStateAction} from 'react'
import {Step} from '../types'

interface IntroduceStepProps {
  setStep: Dispatch<SetStateAction<Step>>
}

const IntroduceStep: React.FC<IntroduceStepProps> = ({setStep}) => {
  const handleNext = () => {
    setStep(Step.LEVEL)
  }

  return (
    <div className="h-screen bg-[url('/assets/auth/sign_up_bg.png')] bg-cover bg-center bg-no-repeat">
      <Container className='flex h-screen items-center justify-start'>
        <div className='w-full md:w-5/12 bg-white rounded-md p-6'>
          <h2 className='text-[28px] font-semibold mb-3'>
            Welcome to HajimeNihongo
          </h2>
          <p className='text-sm leading-6 pr-20'>
            Your account was successfully created. 🎉 Now, let’s get everything
            set up.
            <br />
            This quick process (less than 5 minutes) will help you tune
            HajimeNihongo to your current level and goals!
          </p>
          <Separator className='mt-3 mb-4' />
          <Button
            onClick={handleNext}
            variant='default'
            type='button'
            className='w-full'
          >
            <ArrowRight /> Continue
          </Button>
        </div>
      </Container>
    </div>
  )
}

export default IntroduceStep

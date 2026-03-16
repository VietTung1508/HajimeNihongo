import {Button} from '@/components/ui/button'
import {Step} from '../types'
import {Dispatch, SetStateAction} from 'react'
import {stepMap} from '../utils'

interface FooterProps {
  setStep: Dispatch<SetStateAction<Step>>
  step: Step
  stepOrder: Step[]
}

const Footer: React.FC<FooterProps> = ({setStep, step, stepOrder}) => {
  const handleNext = () => {
    setStep((prev) => {
      const index = stepOrder.indexOf(prev)

      return stepOrder[index + 1] ?? prev
    })
  }

  const handleBack = () => {
    setStep((prev) => {
      const index = stepOrder.indexOf(prev)
      return stepOrder[index - 1] ?? prev
    })
  }

  const nextBtn = stepMap[step].nextButton
  const isLastStep = step === Step.COMPLETED
  return (
    <div className='w-full bg-[#082630] py-2 flex items-center justify-between px-4'>
      <Button
        type='button'
        variant='default'
        className='bg-transparent border px-20 border-red-400 text-red-400'
        onClick={handleBack}
      >
        Back
      </Button>
      <p className='text-base text-center text-[#9FA9AD]'>
        Don’t stress too much about these options.
        <br />
        You can easily change between them at any time.
      </p>
      {isLastStep ? (
        <Button
          type={'submit'}
          variant='default'
          className='text-white px-20'
          key='btn-submit'
        >
          {nextBtn}
        </Button>
      ) : (
        <Button
          type={'button'}
          onClick={handleNext}
          variant='default'
          className='text-white px-20'
        >
          {nextBtn}
        </Button>
      )}
    </div>
  )
}

export default Footer

'use client'

import React from 'react'
import {UseFormReturn} from 'react-hook-form'
import {OnboardingFormValues} from '..'
import {levels} from '@/masterData/level'
import {studyPreferences} from '@/masterData/studyPreference'
import {studyPaces} from '@/masterData/studyPace'
import Image from 'next/image'

interface CompletedStepProps {
  form: UseFormReturn<OnboardingFormValues>
}

const CompletedStep: React.FC<CompletedStepProps> = ({form}) => {
  const values = form.getValues()

  const levelData = levels.find((i) => i.value === values.level)
  const preferenceData = studyPreferences.find(
    (i) => i.value === values.studyPreference,
  )
  const paceData = studyPaces.find((i) => i.value === values.studyPace)

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='relative w-full min-h-80 flex items-end justify-center'>
        {levelData && (
          <Image
            src={levelData.image}
            alt='left'
            width={150}
            height={280}
            className='absolute left-[36%] top-10 -rotate-10 object-cover border-3 border-black rounded-2xl'
          />
        )}

        {preferenceData && (
          <Image
            src={preferenceData.image}
            alt='middle'
            width={170}
            height={320}
            className='absolute left-1/2 top-0 -translate-x-1/2 z-10 object-cover border-3 border-black rounded-2xl'
          />
        )}

        {paceData && (
          <Image
            src={paceData.image}
            alt='right'
            width={150}
            height={280}
            className='absolute right-[36%] top-10 rotate-10 z-20 object-cover border-3 border-black rounded-2xl'
          />
        )}
      </div>
      <div className='text-center text-[19px] leading-6'>
        You're going to start at{' '}
        <span className='font-bold'>
          {levelData?.title} ({values.level})
        </span>
        , studying <span className='font-bold'>{preferenceData?.title}</span> at
        a <span className='font-bold'>{paceData?.title}</span>. <br /> Ready to
        get started?
      </div>
    </div>
  )
}

export default CompletedStep

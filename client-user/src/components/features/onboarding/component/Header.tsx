'use client'

import Container from '@/components/layout/Container'
import {Step} from '../types'
import {stepOrder} from '..'
import Image from 'next/image'
import {stepMap} from '../utils'
import {Dispatch, SetStateAction} from 'react'

interface HeaderProps {
  step: Step
  setStep: Dispatch<SetStateAction<Step>>
}

const Header: React.FC<HeaderProps> = ({step, setStep}) => {
  const currentIndex = stepOrder.indexOf(step)

  return (
    <Container>
      <div className='flex items-center justify-center py-6'>
        {stepOrder.map((s, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const handleGoToStep = () => {
            if (isCompleted) {
              setStep(s)
            }
          }

          return (
            <div key={s} className='flex items-center'>
              <div
                className={`
                w-9 h-9 flex items-center justify-center rounded-full border cursor-pointer
                ${
                  isCompleted
                    ? 'bg-black text-white border-black'
                    : isActive
                      ? 'border-black text-black'
                      : 'border-gray-300 text-gray-300'
                }
              `}
                onClick={handleGoToStep}
              >
                <Image
                  src={stepMap[s].icon}
                  alt='step icon'
                  width={16}
                  height={16}
                />
              </div>

              {index !== stepOrder.length - 1 && (
                <div
                  className={`
                  w-34 h-0.5 mx-2
                  ${index < currentIndex ? 'bg-black' : 'bg-gray-300'}
                `}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className='flex flex-col '>
        <h2 className='text-center text-[22px] text-[#404040] font-bold'>
          {stepMap[step].title}
        </h2>
        {stepMap[step].subTitle && (
          <p className='text-center'>{stepMap[step].subTitle}</p>
        )}
      </div>
    </Container>
  )
}

export default Header

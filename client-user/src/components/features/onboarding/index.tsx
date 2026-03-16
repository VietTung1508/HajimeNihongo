'use client'

import {useEffect, useState} from 'react'
import Footer from './component/Footer'
import Header from './component/Header'
import {LevelEnum, Step, StudyPaceEnum, StudyPreferenceEnum} from './types'
import IntroduceStep from './component/IntroduceStep'
import BaseStep from './component/BaseStep'
import CompletedStep from './component/CompletedStep'
import z from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form} from '@/components/ui/form'
import {levels} from '@/masterData/level'
import {studyPreferences} from '@/masterData/studyPreference'
import {studyPaces} from '@/masterData/studyPace'
import {useAuth} from '../auth/hook/useAuth'
import {useRouter} from 'next/navigation'
import {useOnboarding} from './hook/useOnboarding'

export const levelEnum = z.nativeEnum(LevelEnum)
export const studyPaceEnum = z.nativeEnum(StudyPaceEnum)
export const studyPreferenceEnum = z.nativeEnum(StudyPreferenceEnum)

export const onboardingSchema = z.object({
  level: levelEnum,
  studyPace: studyPaceEnum,
  studyPreference: studyPreferenceEnum,
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

export const stepOrder = [
  Step.INTRODUCE,
  Step.LEVEL,
  Step.STUDY_PREFERENCE,
  Step.STUDY_PACE,
  Step.COMPLETED,
]

const OnboardingMain = () => {
  const router = useRouter()
  const {alreadyOnboard} = useAuth()
  const {completeOnboarding} = useOnboarding()
  const [step, setStep] = useState<Step>(Step.INTRODUCE)
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      level: LevelEnum.ZERO,
      studyPace: StudyPaceEnum.RELAX,
      studyPreference: StudyPreferenceEnum.GRAMMAR,
    },
  })

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      await completeOnboarding(data)
      form.reset()
      router.push('/dashboard')
    } catch (e) {
      console.log(e)
    }
  }

  const isNotIntroduce = step !== Step.INTRODUCE

  useEffect(() => {
    if (alreadyOnboard) {
      router.replace('/')
    }
  }, [alreadyOnboard, router])

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex flex-col min-h-screen'>
            {isNotIntroduce && <Header setStep={setStep} step={step} />}
            <div
              className={`flex-1 ${isNotIntroduce ? 'flex justify-center items-center' : ''}`}
            >
              {step === Step.INTRODUCE && <IntroduceStep setStep={setStep} />}

              {step === Step.LEVEL && (
                <BaseStep data={levels} form={form} name='level' />
              )}

              {step === Step.STUDY_PREFERENCE && (
                <BaseStep
                  data={studyPreferences}
                  form={form}
                  name='studyPreference'
                  isRowData
                />
              )}

              {step === Step.STUDY_PACE && (
                <BaseStep data={studyPaces} form={form} name='studyPace' />
              )}

              {step === Step.COMPLETED && <CompletedStep form={form} />}
            </div>
            {isNotIntroduce && (
              <Footer setStep={setStep} step={step} stepOrder={stepOrder} />
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

export default OnboardingMain

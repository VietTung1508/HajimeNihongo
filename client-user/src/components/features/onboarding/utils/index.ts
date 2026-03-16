import {Step} from '../types'

export const stepMap: Record<
  Step,
  {
    title: string
    nextButton: string
    icon: string
    subTitle?: string
  }
> = {
  [Step.INTRODUCE]: {
    title: 'Welcome to Bunpro!',
    nextButton: 'Continue',
    icon: '/assets/onboarding/step-1.svg',
  },
  [Step.LEVEL]: {
    title: 'What level are you currently studying?',
    nextButton: 'Next',
    icon: '/assets/onboarding/step-2.svg',
  },
  [Step.STUDY_PREFERENCE]: {
    title: 'What do you want to study?',
    nextButton: 'Next',
    icon: '/assets/onboarding/step-3.svg',
  },

  [Step.STUDY_PACE]: {
    title: 'What’s your study pace?',
    nextButton: 'Finish',
    icon: '/assets/onboarding/step-4.svg',
  },
  [Step.COMPLETED]: {
    title: 'Setup Complete 🎉',
    nextButton: "Let's get started",
    icon: '/assets/onboarding/step-5.svg',
    subTitle: 'You’re off to a great start!',
  },
}

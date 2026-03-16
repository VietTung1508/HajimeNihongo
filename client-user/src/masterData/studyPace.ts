import {
  BaseStepItem,
  StudyPaceEnum,
} from '@/components/features/onboarding/types'

export const studyPaces: BaseStepItem[] = [
  {
    value: StudyPaceEnum.RELAX,
    image: '/assets/onboarding/relaxed.svg',
    title: 'Relaxed',
    subTitle: '1 Grammar Points daily',
  },
  {
    value: StudyPaceEnum.DETERMINED,
    image: '/assets/onboarding/determined.svg',
    title: 'Determined',
    subTitle: '2 Grammar Points daily',
  },
  {
    value: StudyPaceEnum.RIGOROUS,
    image: '/assets/onboarding/rigorous.svg',
    title: 'Rigorous',
    subTitle: '4 Grammar Points daily',
  },
]

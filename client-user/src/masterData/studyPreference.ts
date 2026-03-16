import {
  BaseStepItem,
  StudyPreferenceEnum,
} from '@/components/features/onboarding/types'

export const studyPreferences: BaseStepItem[] = [
  {
    value: StudyPreferenceEnum.GRAMMAR,
    image: '/assets/onboarding/grammar.svg',
    title: 'Grammar',
  },
  {
    value: StudyPreferenceEnum.VOCABULARY,
    image: '/assets/onboarding/vocabulary.svg',
    title: 'Vocabulary',
  },
  {
    value: StudyPreferenceEnum.BOTH,
    image: '/assets/onboarding/both.svg',
    title: 'Both Grammar and Vocab',
  },
]

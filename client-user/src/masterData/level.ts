import {BaseStepItem, LevelEnum} from '@/components/features/onboarding/types'

export const levels: BaseStepItem[] = [
  {
    value: LevelEnum.ZERO,
    image: '/assets/onboarding/zero.svg',
    title: 'Absolute Zero',
    desc: 'I have little to no knowledge of Japanese',
  },
  {
    value: LevelEnum.N5,
    image: '/assets/onboarding/N5.svg',
    title: 'Beginner (N5)',
    desc: 'I’m able to read hiragana and katakana, and use some very basic phrases and words.',
  },
  {
    value: LevelEnum.N4,
    image: '/assets/onboarding/N4.svg',
    title: 'Adept (N4)',
    desc: 'I can hold a very basic conversation, and can use a bit of fundamental grammar.',
  },
  {
    value: LevelEnum.N3,
    image: '/assets/onboarding/N3.svg',
    title: 'Seasoned (N3)',
    desc: 'I have an intermediate kanji and vocabulary level, and can use my Japanese in an everyday context.',
  },
  {
    value: LevelEnum.N2,
    image: '/assets/onboarding/N2.svg',
    title: 'Expert (N2)',
    desc: 'I know a lot of kanji and vocabulary, and can use my Japanese in everyday and special contexts.',
  },
  {
    value: LevelEnum.N1,
    image: '/assets/onboarding/N1.svg',
    title: 'Master (N1)',
    desc: 'I understand and use complex written and spoken Japanese in various contexts.',
  },
]

export enum Step {
  INTRODUCE = 'INTRODUCE',
  LEVEL = 'LEVEL',
  STUDY_PREFERENCE = 'STUDY_PREFERENCE',
  STUDY_PACE = 'STUDY_PACE',
  COMPLETED = 'COMPLETED',
}

export enum LevelEnum {
  ZERO = 'ZERO',
  N5 = 'N5',
  N4 = 'N4',
  N3 = 'N3',
  N2 = 'N2',
  N1 = 'N1',
}

export enum StudyPaceEnum {
  RELAX = 'RELAX',
  DETERMINED = 'DETERMINED',
  RIGOROUS = 'RIGOROUS',
}

export enum StudyPreferenceEnum {
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY',
  BOTH = 'BOTH',
}

export interface BaseStepItem<T = string> {
  value: T
  image: string
  title: string
  subTitle?: string
  desc?: string
}

export interface CreateOnboardingRequest {
  level: LevelEnum
  studyPace: StudyPaceEnum
  studyPreference: StudyPreferenceEnum
}

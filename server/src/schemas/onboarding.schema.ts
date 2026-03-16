import {z} from 'zod'
import {
  LevelEnum,
  StudyPaceEnum,
  StudyPreferenceEnum,
} from '../enums/onboarding.enum'

export const onboardingSchema = z.object({
  level: z.enum(LevelEnum),
  studyPace: z.enum(StudyPaceEnum),
  studyPreference: z.enum(StudyPreferenceEnum),
})

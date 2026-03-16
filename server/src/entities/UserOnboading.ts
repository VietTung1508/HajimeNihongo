import {Entity, PrimaryKey, Enum, OneToOne} from '@mikro-orm/core'
import {v4 as uuid} from 'uuid'
import {
  LevelEnum,
  StudyPaceEnum,
  StudyPreferenceEnum,
} from '../enums/onboarding.enum'
import {User} from './User'

@Entity()
export class UserOnboarding {
  @PrimaryKey()
  id: string = uuid()

  @Enum(() => LevelEnum)
  level!: LevelEnum

  @Enum(() => StudyPaceEnum)
  studyPace!: StudyPaceEnum

  @Enum(() => StudyPreferenceEnum)
  studyPreference!: StudyPreferenceEnum

  @OneToOne(() => User)
  user!: User
}

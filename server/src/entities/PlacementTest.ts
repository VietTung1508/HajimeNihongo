import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
} from '@mikro-orm/core'
import {User} from './User'
import {LevelEnum} from '../enums/onboarding.enum'

export type PlacementTestQuestion = {
  id: number
  type: 'word' | 'grammar'
  isCorrect: boolean
}

export type PlacementTestStatus = 'passed' | 'failed' | 'forced'

@Entity()
export class PlacementTest {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @Enum(() => LevelEnum)
  level!: LevelEnum

  @Property()
  score!: number

  @Property()
  attemptNumber!: number

  @Property({type: 'json'})
  questions!: PlacementTestQuestion[]

  @Property()
  status!: PlacementTestStatus

  @Property({onCreate: () => new Date()})
  createdAt: Date = new Date()
}

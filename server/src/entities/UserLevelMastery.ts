import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Unique,
  Index,
  Enum,
} from '@mikro-orm/core'
import {User} from './User'
import {LevelEnum} from '../enums/onboarding.enum'
import {MasteryTypeEnum} from '../enums/mastery.enum'

@Entity()
@Unique({properties: ['user', 'level']})
@Index({properties: ['user']})
@Index({properties: ['level']})
export class UserLevelMastery {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @Enum(() => LevelEnum)
  level!: LevelEnum

  @Enum(() => MasteryTypeEnum)
  masteryType!: MasteryTypeEnum

  @Property({nullable: true})
  waivedAt?: Date

  @Property({nullable: true})
  earnedAt?: Date

  @Property({onCreate: () => new Date()})
  createdAt: Date = new Date()
}

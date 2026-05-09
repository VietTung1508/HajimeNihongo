import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
} from '@mikro-orm/core'
import {User} from './User'

@Entity()
export class Streak {
  @PrimaryKey()
  id!: number

  @OneToOne(() => User, {owner: true})
  user!: User

  @Property()
  currentStreak!: number

  @Property()
  longestStreak!: number

  @Property({nullable: true})
  lastCompletedDate?: Date

  @Property({nullable: true})
  freezeAvailableAt?: Date

  @Property({default: 0})
  freezesUsed!: number
}

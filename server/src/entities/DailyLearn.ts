import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Index,
  Collection,
} from '@mikro-orm/core'
import {User} from './User'
import {DailyLearnItem} from './DailyLearnItem'
import {DailyLearnStatus} from '../enums/learn.enum'

@Entity()
@Index({properties: ['user']})
@Index({properties: ['generatedDate']})
export class DailyLearn {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @Property()
  generatedDate!: Date

  @Property()
  status!: DailyLearnStatus

  @Property({nullable: true})
  completedAt?: Date

  @Property({default: false})
  isExtraBatch!: boolean

  @OneToMany(() => DailyLearnItem, item => item.dailyLearn)
  items = new Collection<DailyLearnItem>(this)
}

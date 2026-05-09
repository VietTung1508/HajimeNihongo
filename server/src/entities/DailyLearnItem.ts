import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from '@mikro-orm/core'
import {DailyLearn} from './DailyLearn'
import {Word} from './Word'
import {Grammar} from './Grammar'

@Entity()
@Index({properties: ['dailyLearn']})
@Index({properties: ['word']})
@Index({properties: ['grammar']})
export class DailyLearnItem {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => DailyLearn)
  dailyLearn!: DailyLearn

  @ManyToOne(() => Word, {nullable: true})
  word?: Word

  @ManyToOne(() => Grammar, {nullable: true})
  grammar?: Grammar

  @Property({nullable: true})
  viewedAt?: Date

  @Property({nullable: true})
  pushedToReviewAt?: Date

  @Property({nullable: true})
  masteredAt?: Date
}

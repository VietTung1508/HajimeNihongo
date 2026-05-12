import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from '@mikro-orm/core'
import {User} from './User'
import {Word} from './Word'
import {Grammar} from './Grammar'

@Entity()
@Index({properties: ['user']})
@Index({properties: ['user', 'word']})
@Index({properties: ['user', 'grammar']})
@Index({properties: ['reviewedAt']})
export class ReviewHistory {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @ManyToOne(() => Word, {nullable: true})
  word?: Word

  @ManyToOne(() => Grammar, {nullable: true})
  grammar?: Grammar

  @Property()
  isCorrect!: boolean

  @Property()
  reviewedAt!: Date
}

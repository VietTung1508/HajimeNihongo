import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Unique,
  Index,
} from '@mikro-orm/core'
import {User} from './User'
import {Word} from './Word'
import {Grammar} from './Grammar'

@Entity()
@Unique({properties: ['user', 'word']})
@Unique({properties: ['user', 'grammar']})
@Index({properties: ['user']})
@Index({properties: ['createdAt']})
export class Bookmark {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @ManyToOne(() => Word, {nullable: true})
  word?: Word

  @ManyToOne(() => Grammar, {nullable: true})
  grammar?: Grammar

  @Property()
  createdAt!: Date
}

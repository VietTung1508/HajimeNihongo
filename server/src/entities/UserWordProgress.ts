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

@Entity()
@Unique({properties: ['user', 'word']})
@Index({properties: ['user']})
@Index({properties: ['word']})
export class UserWordProgress {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @ManyToOne(() => Word)
  word!: Word

  @Property()
  masteredAt!: Date
}

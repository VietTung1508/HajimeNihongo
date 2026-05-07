import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Unique,
  Index,
} from '@mikro-orm/core'
import {User} from './User'
import {Grammar} from './Grammar'

@Entity()
@Unique({properties: ['user', 'grammar']})
@Index({properties: ['user']})
@Index({properties: ['grammar']})
export class UserGrammarProgress {
  @PrimaryKey()
  id!: number

  @ManyToOne(() => User)
  user!: User

  @ManyToOne(() => Grammar)
  grammar!: Grammar

  @Property()
  masteredAt!: Date
}

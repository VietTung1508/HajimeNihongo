import {Entity, PrimaryKey, ManyToOne, Property, Enum, Index} from '@mikro-orm/core'
import {v4 as uuid} from 'uuid'
import {User} from './User'
import {ChatModeEnum} from '../enums/chat.enum'

@Entity()
@Index({properties: ['user', 'createdAt']})
export class ChatSession {
  @PrimaryKey()
  id: string = uuid()

  @ManyToOne(() => User, {deleteRule: 'cascade'})
  user!: User

  @Property({length: 60})
  title: string = ''

  @Enum(() => ChatModeEnum)
  lastMode: ChatModeEnum = ChatModeEnum.FREE

  @Property()
  createdAt: Date = new Date()

  @Property()
  isFavorite: boolean = false

  @Property({onUpdate: () => new Date()})
  updatedAt: Date = new Date()
}

import {Entity, PrimaryKey, ManyToOne, Property, Enum, Index} from '@mikro-orm/core'
import {v4 as uuid} from 'uuid'
import {ChatSession} from './ChatSession'
import {ChatModeEnum} from '../enums/chat.enum'

export enum MessageRoleEnum {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity()
@Index({properties: ['session', 'createdAt']})
export class ChatMessage {
  @PrimaryKey()
  id: string = uuid()

  @ManyToOne(() => ChatSession, {deleteRule: 'cascade'})
  session!: ChatSession

  @Enum(() => MessageRoleEnum)
  role!: MessageRoleEnum

  @Property({columnType: 'text'})
  content!: string

  @Enum(() => ChatModeEnum)
  mode!: ChatModeEnum

  @Property({default: false})
  isVoice: boolean = false

  @Property()
  createdAt: Date = new Date()
}

import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'

@Entity()
export class Permission {
  @PrimaryKey()
  id: string = uuid()

  @Property({ unique: true })
  key!: string // strict format: "module:action"
}

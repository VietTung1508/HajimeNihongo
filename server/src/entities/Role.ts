import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Permission } from './Permission'

@Entity()
export class Role {
  @PrimaryKey()
  id: string = uuid()

  @Property({ unique: true })
  name!: string

  @Property({ default: false })
  isSystem: boolean = false

  @Property({ onCreate: () => new Date() })
  createdAt!: Date

  @ManyToMany(() => Permission)
  permissions = new Collection<Permission>(this)
}

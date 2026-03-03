import {Entity, PrimaryKey, Property, Enum} from '@mikro-orm/core'
import {v4 as uuid} from 'uuid'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryKey()
  id: string = uuid()

  @Property({unique: true})
  email!: string

  @Property()
  phone_number!: string

  @Property()
  password!: string

  @Enum(() => UserRole)
  role: UserRole = UserRole.USER

  @Property({onCreate: () => new Date()})
  createdAt!: Date
}

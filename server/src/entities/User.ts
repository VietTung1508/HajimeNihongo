import {Entity, PrimaryKey, Property, Enum, OneToOne} from '@mikro-orm/core'
import {v4 as uuid} from 'uuid'
import {UserRole} from '../enums/auth.enum'
import {UserOnboarding} from './UserOnboading'

@Entity()
export class User {
  @PrimaryKey()
  id: string = uuid()

  @Property({unique: true})
  email!: string

  @Property()
  username!: string

  @Property({nullable: true})
  phone_number!: string

  @Property()
  password!: string

  @Enum(() => UserRole)
  role: UserRole = UserRole.USER

  @Property({onCreate: () => new Date()})
  createdAt!: Date

  @OneToOne(() => UserOnboarding, (onboarding) => onboarding.user, {
    nullable: true,
  })
  onboarding?: UserOnboarding
}

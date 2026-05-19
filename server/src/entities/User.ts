import { Collection, Entity, Enum, ManyToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { GenderEnum } from '../enums/auth.enum'
import { Role } from './Role'
import { UserOnboarding } from './UserOnboading'

@Entity()
export class User {
  @PrimaryKey()
  id: string = uuid()

  @Property({ unique: true })
  email!: string

  @Property()
  username!: string

  @Property({ nullable: true })
  phone_number!: string

  @Property()
  password!: string

  @Property({ nullable: true })
  avatarUrl?: string

  @Enum({ items: () => GenderEnum, nullable: true })
  gender?: GenderEnum

  @Property({ nullable: true, type: 'date' })
  dateOfBirth?: Date

  @Property({ default: false })
  mustChangePassword: boolean = false

  @Property({ onCreate: () => new Date() })
  createdAt!: Date

  @Property({ nullable: true, type: 'datetime' })
  lastLoginAt?: Date

  @ManyToMany(() => Role)
  roles = new Collection<Role>(this)

  @OneToOne(() => UserOnboarding, (onboarding) => onboarding.user, {
    nullable: true,
  })
  onboarding?: UserOnboarding
}

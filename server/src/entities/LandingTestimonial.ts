import {Entity, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class LandingTestimonial {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property()
  userTitle!: string

  @Property({type: 'text'})
  content!: string

  @Property({nullable: true})
  avatarUrl?: string

  @Property()
  position!: number

  @Property({onCreate: () => new Date()})
  createdAt: Date = new Date()

  @Property({onUpdate: () => new Date(), onCreate: () => new Date()})
  updatedAt: Date = new Date()
}

import {Entity, PrimaryKey, Property, Enum} from '@mikro-orm/core'

export enum SectionKey {
  HERO = 'hero',
  TESTIMONIALS = 'testimonials',
  CHATBOT = 'chatbot',
  CTA = 'cta',
}

@Entity()
export class LandingConfig {
  @PrimaryKey()
  id!: number

  @Enum(() => SectionKey)
  sectionKey!: SectionKey

  @Property({type: 'json', nullable: true})
  content?: Record<string, unknown>

  @Property()
  position!: number

  @Property({onCreate: () => new Date()})
  createdAt: Date = new Date()

  @Property({onUpdate: () => new Date(), onCreate: () => new Date()})
  updatedAt: Date = new Date()
}

import {Entity, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class KanaSection {
  @PrimaryKey()
  id!: number

  @Property()
  type!: 'hiragana' | 'katakana'

  @Property()
  title!: string

  @Property({type: 'text'})
  content!: string

  @Property()
  order!: number
}

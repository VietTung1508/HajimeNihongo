import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Cascade,
  Collection,
} from '@mikro-orm/core'
import {Meaning} from './Meaning'
import {Example} from './Example'

@Entity()
export class Word {
  @PrimaryKey()
  id!: number

  @Property({unique: true})
  entSeq!: number

  @Property({nullable: true})
  kanji?: string

  @Property()
  reading!: string

  @Property({default: false})
  isCommon: boolean = false

  @Property({nullable: true})
  jlptLevel?: number

  @Property({nullable: true})
  audioUrl?: string

  @OneToMany(() => Example, (e) => e.word)
  examples = new Collection<Example>(this)

  @OneToMany(() => Meaning, (m) => m.word, {cascade: [Cascade.PERSIST]})
  meanings = new Collection<Meaning>(this)
}

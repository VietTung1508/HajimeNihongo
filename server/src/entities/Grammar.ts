import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core'
import {GrammarExample} from './GrammarExample'

@Entity()
export class Grammar {
  @PrimaryKey()
  id!: number

  @Property()
  grammarPoint!: string

  @Property()
  meaning!: string

  @Property()
  level!: string

  @Property({nullable: true})
  lessonNumber?: number

  @Property({nullable: true})
  lessonTitle?: string

  @Property({type: 'text', nullable: true})
  structure?: string

  @Property({type: 'text', nullable: true})
  structureDisplay?: string

  @Property({nullable: true})
  partOfSpeech?: string

  @Property({nullable: true})
  register?: string

  @Property({type: 'text', nullable: true})
  about?: string

  @Property({type: 'text', nullable: true})
  exampleJp?: string

  @Property({type: 'text', nullable: true})
  exampleEn?: string

  @Property({nullable: true})
  synonyms?: string

  @Property({nullable: true})
  antonyms?: string

  @Property({nullable: true})
  meaningHint?: string

  @OneToMany(() => GrammarExample, (e) => e.grammar)
  examples = new Collection<GrammarExample>(this)
}

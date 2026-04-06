import {Entity, PrimaryKey, Property, ManyToOne} from '@mikro-orm/core'
import {Grammar} from './Grammar'

@Entity()
export class GrammarExample {
  @PrimaryKey()
  id!: number

  @Property({type: 'text'})
  sentence!: string

  @Property({type: 'text'})
  translation!: string

  @Property({nullable: true})
  audioUrl?: string

  @ManyToOne(() => Grammar)
  grammar!: Grammar   // DB column: grammar_id
}
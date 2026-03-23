import {Entity, PrimaryKey, Property, ManyToOne} from '@mikro-orm/core'
import {Word} from './Word'

@Entity()
export class Example {
  @PrimaryKey()
  id!: number

  @Property({type: 'text'})
  sentence!: string

  @Property({type: 'text'})
  translation!: string

  @Property({nullable: true})
  audioUrl?: string

  @ManyToOne(() => Word)
  word!: Word
}

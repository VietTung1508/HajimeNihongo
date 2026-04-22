import {Entity, PrimaryKey, Property, ManyToOne} from '@mikro-orm/core'
import {Word} from './Word'

@Entity()
export class Meaning {
  @PrimaryKey()
  id!: number

  @Property({type: 'text', fieldName: 'text'})
  text!: string

  @ManyToOne(() => Word)
  word!: Word
}

import fs from 'fs'
import {XMLParser} from 'fast-xml-parser'
import {MikroORM} from '@mikro-orm/core'
import config from '../mikro-orm.config'
import {Word} from '../entities/Word'
import {Meaning} from '../entities/Meaning'

const normalizeArray = (item: any) => {
  if (!item) return []
  return Array.isArray(item) ? item : [item]
}

async function run() {
  // File check before any DB connection
  if (!fs.existsSync('JMdict_e.xml')) {
    console.error('ERROR: JMdict_e.xml not found. Run from server/ directory.')
    process.exit(1)
  }

  console.log('Reading XML...')
  const xml = fs.readFileSync('JMdict_e.xml', 'utf-8')

  const parser = new XMLParser({ignoreAttributes: false, processEntities: false})
  console.log('Parsing...')
  const data = parser.parse(xml)
  const entries = data.JMdict.entry

  const orm = await MikroORM.init(config)
  const em = orm.em.fork()

  console.log('Loading existing words...')
  const existingWords = await em.find(Word, {}, {fields: ['entSeq']})
  const existingSet = new Set(existingWords.map((w) => w.entSeq))
  console.log(`Existing words: ${existingSet.size}`)

  const BATCH_SIZE = 500
  const totalBatches = Math.ceil(entries.length / BATCH_SIZE)

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const batch = entries.slice(i, i + BATCH_SIZE)
    const words: Word[] = []

    for (const entry of batch) {
      const entSeq = Number(entry.ent_seq)
      if (existingSet.has(entSeq)) continue

      const kanjiList = normalizeArray(entry.k_ele).map((k: any) => k.keb)
      const readingList = normalizeArray(entry.r_ele).map((r: any) => r.reb)
      const senses = normalizeArray(entry.sense)
      const meanings = senses
        .flatMap((s: any) =>
          normalizeArray(s.gloss).map((g: any) =>
            typeof g === 'string' ? g : g['#text'],
          ),
        )
        .filter((m: string | undefined) => !!m && m.trim().length > 0)

      if (!readingList[0] || meanings.length === 0) continue

      const word = new Word()
      word.entSeq = entSeq
      word.kanji = kanjiList[0] || null
      word.reading = readingList[0]

      for (const m of meanings) {
        const meaning = new Meaning()
        meaning.text = m.trim()
        word.meanings.add(meaning)
      }

      words.push(word)
    }

    if (words.length === 0) {
      console.log(`[batch ${batchNum}/${totalBatches}] skipped (all existing)`)
      continue
    }

    const batchEm = orm.em.fork()
    await batchEm.begin()
    try {
      for (const w of words) batchEm.persist(w)
      await batchEm.flush()
      await batchEm.commit()
      words.forEach((w) => existingSet.add(w.entSeq))
      console.log(`[batch ${batchNum}/${totalBatches}] committed ${words.length} words`)
    } catch (err) {
      await batchEm.rollback()
      console.error(`[batch ${batchNum}] rolled back:`, err)
      process.exit(1)
    }
  }

  console.log('Done!')
  await orm.close(true)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})

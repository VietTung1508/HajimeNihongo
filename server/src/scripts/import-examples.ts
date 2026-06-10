import fs from 'fs'
import {parse} from 'csv-parse/sync'
import {MikroORM} from '@mikro-orm/core'
import {Example} from '../entities/Example'
import {Word} from '../entities/Word'
import mikroOrmConfig from '../mikro-orm.config'

async function main() {
  // File check before any DB connection
  if (!fs.existsSync('./sentences.tsv')) {
    console.error('ERROR: sentences.tsv not found. Run from server/ directory.')
    process.exit(1)
  }

  const orm = await MikroORM.init(mikroOrmConfig)
  const em = orm.em.fork()

  console.log('Loading word index...')
  const words = await em.find(Word, {}, {fields: ['id', 'entSeq']})
  const entSeqToId = new Map<number, number>()
  for (const w of words) entSeqToId.set(w.entSeq, w.id)
  console.log(`Loaded ${entSeqToId.size} words`)

  // Pre-load existing examples to avoid per-row DB queries on re-runs
  const conn = orm.em.getConnection()
  const existingRows = await conn.execute('SELECT word_id, sentence FROM "example"')
  const existingSet = new Set<string>(existingRows.map((r: any) => `${r.word_id}::${r.sentence}`))
  console.log(`Pre-loaded ${existingSet.size} existing examples`)

  const raw = fs.readFileSync('./sentences.tsv', 'utf-8')
  const rows: string[][] = parse(raw, {
    delimiter: '\t',
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
    quote: false,
  })

  const BATCH_SIZE = 500
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const toInsert: {wordId: number; sentence: string; translation: string}[] = []

    for (const row of batch) {
      const [sentenceIdRaw, sentenceRaw, , translationRaw] = row
      const sentence = sentenceRaw?.trim()
      const translation = translationRaw?.trim()
      const entSeq = parseInt(sentenceIdRaw?.trim() || '', 10)

      if (isNaN(entSeq) || !sentence || !translation) { skipped++; continue }

      const wordId = entSeqToId.get(entSeq)
      if (!wordId) { skipped++; continue }

      const key = `${wordId}::${sentence}`
      if (existingSet.has(key)) { skipped++; continue }

      existingSet.add(key)
      toInsert.push({wordId, sentence, translation})
    }

    if (toInsert.length === 0) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} (no new rows)`)
      continue
    }

    const batchEm = orm.em.fork()
    await batchEm.begin()
    try {
      for (const {wordId, sentence, translation} of toInsert) {
        batchEm.persist(batchEm.create(Example, {
          sentence,
          translation,
          word: batchEm.getReference(Word, wordId),
        }))
      }
      await batchEm.flush()
      await batchEm.commit()
      inserted += toInsert.length
    } catch (err) {
      await batchEm.rollback()
      console.error(`Batch at row ${i} rolled back:`, err)
      process.exit(1)
    }

    console.log(`Progress: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} rows — inserted: ${inserted}`)
  }

  console.log(`Done! Inserted: ${inserted}, Skipped: ${skipped}`)
  await orm.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

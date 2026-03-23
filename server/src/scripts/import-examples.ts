import fs from 'fs'
import {parse} from 'csv-parse/sync'
import {MikroORM} from '@mikro-orm/core'
import {Example} from '../entities/Example'
import {Word} from '../entities/Word'
import mikroOrmConfig from '../mikro-orm.config'

async function main() {
  const orm = await MikroORM.init(mikroOrmConfig)
  const em = orm.em.fork()

  // Build a map of entSeq -> Word id
  console.log('Loading word index...')
  const words = await em.find(Word, {}, {fields: ['id', 'entSeq']})
  const entSeqToId = new Map<number, number>()
  for (const w of words) {
    entSeqToId.set(w.entSeq, w.id)
  }
  console.log(`Loaded ${entSeqToId.size} words`)

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

  //   for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  //     const batch = rows.slice(i, i + BATCH_SIZE)

  //     for (const [sentenceId, sentence, , translation] of batch) {
  //       const entSeq = parseInt(sentenceId, 10)
  //       if (isNaN(entSeq) || !sentence?.trim() || !translation?.trim()) {
  //         skipped++
  //         continue
  //       }

  //       const wordId = entSeqToId.get(entSeq)
  //       if (!wordId) {
  //         skipped++
  //         continue
  //       }

  //       em.persist(
  //         em.create(Example, {
  //           sentence: sentence.trim(),
  //           translation: translation.trim(),
  //           word: em.getReference(Word, wordId),
  //         }),
  //       )

  //       inserted++
  //     }

  //     await em.flush()
  //     em.clear()
  //     console.log(
  //       `Progress: ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} rows processed`,
  //     )
  //   }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    for (const row of batch) {
      const [sentenceIdRaw, sentenceRaw, , translationRaw] = row

      const sentenceId = sentenceIdRaw?.trim()
      const sentence = sentenceRaw?.trim()
      const translation = translationRaw?.trim()

      const entSeq = parseInt(sentenceId || '', 10)

      // Check reasons for skipping
      if (isNaN(entSeq)) {
        console.log(`Skipped row ${i}: invalid sentenceId "${sentenceIdRaw}"`)
        skipped++
        continue
      }
      if (!sentence) {
        console.log(`Skipped row ${i}: empty sentence for entSeq ${entSeq}`)
        skipped++
        continue
      }
      if (!translation) {
        console.log(`Skipped row ${i}: empty translation for entSeq ${entSeq}`)
        skipped++
        continue
      }

      const wordId = entSeqToId.get(entSeq)
      if (!wordId) {
        console.log(`Skipped row ${i}: no Word found for entSeq ${entSeq}`)
        skipped++
        continue
      }
      const exists = await em.findOne(Example, {
        word: wordId,
        sentence: sentence,
      })

      if (exists) {
        skipped++
        continue
      }

      // Create Example
      em.persist(
        em.create(Example, {
          sentence,
          translation,
          word: em.getReference(Word, wordId),
        }),
      )

      inserted++
    }

    await em.flush()
    em.clear()
    console.log(
      `Progress: ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} rows processed`,
    )
  }

  console.log(`Done! Inserted: ${inserted}, Skipped: ${skipped}`)

  await orm.close()
  console.log(`Done! Inserted: ${inserted}, Skipped: ${skipped}`)
}

main().catch(console.error)

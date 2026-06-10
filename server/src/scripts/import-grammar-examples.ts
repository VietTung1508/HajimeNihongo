/**
 * import-grammar-examples.ts
 *
 * Maps sentences from sentences.tsv to grammar points via pattern matching.
 * Safe to re-run: skips already-inserted examples using a pre-loaded dedup set.
 *
 * Usage:
 *   npx ts-node src/scripts/import-grammar-examples.ts
 */

import fs from 'fs'
import {parse} from 'csv-parse/sync'
import {MikroORM} from '@mikro-orm/core'
import {Grammar} from '../entities/Grammar'
import {GrammarExample} from '../entities/GrammarExample'
import mikroOrmConfig from '../mikro-orm.config'

// ─── Pattern Matching ─────────────────────────────────────────────────────────

function patternToRegex(pattern: string): RegExp {
  let search = pattern
    .replace(/^〜/, '')
    .replace(/^\d+\./, '')
    .trim()

  if (search.includes('いう') || search.includes('いう')) {
    search = search.replace(/という/g, '.*という')
  }

  // Escape regex special characters BEFORE substituting placeholders
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Replace full-width placeholders AFTER escaping (so they become real regex groups)
  const withPlaceholders = escaped
    .replace(/Ｎ/g, '([^…]+?)')
    .replace(/Ｖ/g, '([^…]+?)')

  try {
    return new RegExp(withPlaceholders, 'i')
  } catch {
    return new RegExp(escaped, 'i')
  }
}

function sentenceMatchesPattern(sentence: string, grammarPoint: string): boolean {
  const pattern = grammarPoint.trim()

  if (sentence.includes(pattern.replace(/^〜/, '').replace(/^\d+\./, '').trim())) {
    return true
  }

  try {
    return patternToRegex(pattern).test(sentence)
  } catch {
    return false
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // File check before any DB connection
  if (!fs.existsSync('./sentences.tsv')) {
    console.error('ERROR: sentences.tsv not found. Run from server/ directory.')
    process.exit(1)
  }

  const orm = await MikroORM.init(mikroOrmConfig)
  const em = orm.em.fork()

  console.log('Loading grammar points...')
  const grammarPoints = await em.find(Grammar, {})
  console.log(`Loaded ${grammarPoints.length} grammar points`)

  // Pre-load existing (grammar_id, sentence) pairs — avoids duplicates on re-run
  const conn = orm.em.getConnection()
  const existingRows = await conn.execute('SELECT grammar_id, sentence FROM "grammar_example"')
  const existingSet = new Set<string>(
    existingRows.map((r: any) => `${r.grammar_id}::${r.sentence}`),
  )
  console.log(`Pre-loaded ${existingSet.size} existing grammar examples`)

  console.log('Loading sentences...')
  const raw = fs.readFileSync('./sentences.tsv', 'utf-8')
  const rows: string[][] = parse(raw, {
    delimiter: '\t',
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
    quote: false,
  })

  const sentences: {jp: string; en: string}[] = []
  for (const row of rows) {
    const [, sentence, , translation] = row
    if (sentence?.trim() && translation?.trim()) {
      sentences.push({jp: sentence.trim(), en: translation.trim()})
    }
  }
  console.log(`Loaded ${sentences.length} sentences`)

  const GRAMMAR_BATCH = 50
  let totalCreated = 0
  let processed = 0

  for (let i = 0; i < grammarPoints.length; i += GRAMMAR_BATCH) {
    const batch = grammarPoints.slice(i, i + GRAMMAR_BATCH)
    const toInsert: {grammarId: number; sentence: string; translation: string}[] = []

    for (const grammar of batch) {
      const matches = sentences
        .filter(s => sentenceMatchesPattern(s.jp, grammar.grammarPoint))
        .slice(0, 5)

      for (const {jp, en} of matches) {
        const key = `${grammar.id}::${jp}`
        if (existingSet.has(key)) continue
        existingSet.add(key)
        toInsert.push({grammarId: grammar.id, sentence: jp, translation: en})
      }

      processed++
    }

    if (toInsert.length > 0) {
      const batchEm = orm.em.fork()
      await batchEm.begin()
      try {
        for (const {grammarId, sentence, translation} of toInsert) {
          batchEm.persist(batchEm.create(GrammarExample, {
            sentence,
            translation,
            grammar: batchEm.getReference(Grammar, grammarId),
          }))
        }
        await batchEm.flush()
        await batchEm.commit()
        totalCreated += toInsert.length
      } catch (err) {
        await batchEm.rollback()
        console.error(`Batch at grammar ${i} rolled back:`, err)
        process.exit(1)
      }
    }

    console.log(`Progress: ${processed}/${grammarPoints.length} grammar points — ${totalCreated} examples created`)
  }

  console.log(`\n✅ Done! Created ${totalCreated} grammar examples from ${processed} grammar points`)
  await orm.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

/**
 * import-grammar-examples.ts
 *
 * Maps sentences from sentences.tsv to grammar points based on pattern matching.
 * Each grammar point's examples are populated with matching sentences.
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

// ─── Pattern Matching ───────────────────────────────────────────────────────────

/**
 * Converts a grammar pattern to a regex for matching Japanese sentences.
 * Handles:
 * - "〜てみる" -> matches sentences containing "てみる"
 * - "〜ないで" -> matches sentences containing "ないで"
 * - "ＮというＮ" -> matches "([^…]+?)という([^…]+?)" (noun pattern)
 * - "Ｖてあげる" -> matches "([^…]+?て)あげる" (verb pattern)
 */
function patternToRegex(pattern: string): RegExp {
  // Remove common prefix markers
  let search = pattern
    .replace(/^〜/, '') // Remove "〜" prefix
    .replace(/^\d+\./, '') // Remove "1." prefix
    .trim()

  // Handle noun placeholders (Ｎ)
  search = search.replace(/Ｎ/g, '([^…]+?)')

  // Handle verb placeholders (Ｖ)
  search = search.replace(/Ｖ/g, '([^…]+?)')

  // Handle special patterns
  if (search.includes('いう') || search.includes('いう')) {
    // For "〜という" patterns, be more flexible
    search = search.replace(/という/g, '.*という')
  }

  // Escape regex special characters except our placeholders
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\[\^.\.\+\\\?\]/g, '([^…]+?)')

  // Create regex - match anywhere in sentence
  try {
    return new RegExp(escaped, 'i')
  } catch {
    // Fallback to literal search if regex fails
    return new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  }
}

/**
 * Checks if a sentence matches a grammar pattern.
 * Uses multiple strategies for better matching.
 */
function sentenceMatchesPattern(sentence: string, grammarPoint: string): boolean {
  const pattern = grammarPoint.trim()

  // Strategy 1: Direct substring match (simple patterns)
  if (sentence.includes(pattern.replace(/^〜/, '').replace(/^\d+\./, '').trim())) {
    return true
  }

  // Strategy 2: Regex match for complex patterns
  try {
    const regex = patternToRegex(pattern)
    if (regex.test(sentence)) {
      return true
    }
  } catch {
    // Ignore regex errors
  }

  return false
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const orm = await MikroORM.init(mikroOrmConfig)
  const em = orm.em.fork()

  console.log('Loading grammar points...')
  const grammarPoints = await em.find(Grammar, {})
  console.log(`Loaded ${grammarPoints.length} grammar points`)

  console.log('Loading sentences...')
  const raw = fs.readFileSync('./sentences.tsv', 'utf-8')
  const rows: string[][] = parse(raw, {
    delimiter: '\t',
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
    quote: false,
  })

  // Build sentence list
  const sentences: {jp: string; en: string}[] = []
  for (const row of rows) {
    const [, sentence, , translation] = row
    if (sentence?.trim() && translation?.trim()) {
      sentences.push({jp: sentence.trim(), en: translation.trim()})
    }
  }
  console.log(`Loaded ${sentences.length} sentences`)

  // Find and create examples for each grammar point
  const BATCH_SIZE = 500
  let totalExamplesCreated = 0
  let processedCount = 0

  // Clear existing examples to avoid duplicates
  console.log('Clearing existing grammar examples...')
  await em.nativeDelete(GrammarExample, {})
  console.log('Cleared existing examples')

  for (const grammar of grammarPoints) {
    // Find sentences matching this grammar point
    const matchingSentences = sentences.filter((s) =>
      sentenceMatchesPattern(s.jp, grammar.grammarPoint),
    )

    // Limit to 5 examples per grammar point to avoid overwhelming data
    const examplesToAdd = matchingSentences.slice(0, 5)

    for (const {jp, en} of examplesToAdd) {
      em.persist(
        em.create(GrammarExample, {
          sentence: jp,
          translation: en,
          grammar: em.getReference(Grammar, grammar.id),
        }),
      )
      totalExamplesCreated++
    }

    processedCount++
    if (processedCount % 50 === 0) {
      await em.flush()
      em.clear()
      console.log(
        `Progress: ${processedCount}/${grammarPoints.length} grammar points, ${totalExamplesCreated} examples created`,
      )
    }

    // Log grammar points with no matches
    if (matchingSentences.length === 0) {
      console.log(`No matches for: ${grammar.grammarPoint} (${grammar.level})`)
    }
  }

  await em.flush()
  em.clear()

  console.log(`\n✅ Done! Created ${totalExamplesCreated} grammar examples`)
  console.log(`   Processed ${processedCount} grammar points`)

  await orm.close()
}

main().catch(console.error)

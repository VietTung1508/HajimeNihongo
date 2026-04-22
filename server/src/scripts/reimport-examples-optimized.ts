import fs from 'fs'
import {parse} from 'csv-parse/sync'
import {MikroORM} from '@mikro-orm/core'
import {Example} from '../entities/Example'
import {Word} from '../entities/Word'
import mikroOrmConfig from '../mikro-orm.config'

// Build reverse index: all possible word substrings -> word IDs
function buildWordIndex(words: Word[]): Map<string, number[]> {
  const index = new Map<string, number[]>()
  const seen = new Set<string>()

  console.log('Building word index...')

  for (const word of words) {
    const targets: string[] = []

    // Add kanji
    if (word.kanji) {
      targets.push(word.kanji)
      // Add individual kanji for multi-kanji words
      if (word.kanji.length > 1) {
        for (let i = 0; i < word.kanji.length; i++) {
          for (let j = i + 1; j <= word.kanji.length; j++) {
            const substr = word.kanji.substring(i, j)
            if (substr.length >= 2) targets.push(substr)
          }
        }
      }
    }

    // Add reading (kana)
    targets.push(word.reading)
    // Add individual kana sequences for multi-kana readings
    if (word.reading.length > 1) {
      for (let i = 0; i < word.reading.length; i++) {
        for (let j = i + 2; j <= word.reading.length; j++) {
          const substr = word.reading.substring(i, j)
          if (substr.length >= 2) targets.push(substr)
        }
      }
    }

    // Index each unique form
    for (const form of targets) {
      const key = form.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        const existing = index.get(key) || []
        existing.push(word.id)
        index.set(key, existing)
      }
    }
  }

  console.log(`Index built with ${index.size} unique forms`)
  return index
}

// Find words that appear in sentence using index
function findWordsInSentence(
  sentence: string,
  wordIndex: Map<string, number[]>,
  wordMap: Map<number, Word>,
): Word[] {
  const matchedWordIds = new Set<number>()
  const cleaned = sentence.replace(/[。、！？「」『』（）\s]/g, '')

  // Check all substrings of the sentence
  for (let i = 0; i < cleaned.length; i++) {
    // Check substrings from 2 to 10 characters (typical word length)
    const maxLen = Math.min(i + 10, cleaned.length)
    for (let j = i + 2; j <= maxLen; j++) {
      const substr = cleaned.substring(i, j).toLowerCase()
      const wordIds = wordIndex.get(substr)
      if (wordIds) {
        for (const wid of wordIds) {
          const word = wordMap.get(wid)
          if (word) {
            // Verify actual match (not just substring collision)
            if (word.kanji && cleaned.includes(word.kanji)) {
              matchedWordIds.add(wid)
            } else if (cleaned.includes(word.reading)) {
              matchedWordIds.add(wid)
            }
          }
        }
      }
    }
  }

  return Array.from(matchedWordIds).map((id) => wordMap.get(id)!).filter(Boolean)
}

async function main() {
  const orm = await MikroORM.init(mikroOrmConfig)
  const em = orm.em.fork()

  console.log('=== RE-IMPORTING EXAMPLES (OPTIMIZED) ===\n')

  // Step 1: Delete all existing examples
  console.log('Step 1: Deleting all existing examples...')
  const existingCount = await em.count(Example)
  await em.nativeDelete(Example, {})
  console.log(`Deleted ${existingCount} existing examples\n`)

  // Step 2: Load all words
  console.log('Step 2: Loading all words...')
  const words = await em.find(Word, {})
  const wordMap = new Map(words.map((w) => [w.id, w]))
  console.log(`Loaded ${words.length} words\n`)

  // Step 3: Build search index
  const wordIndex = buildWordIndex(words)
  console.log()

  // Step 4: Parse sentences
  console.log('Step 3: Parsing sentences.tsv...')
  const raw = fs.readFileSync('./sentences.tsv', 'utf-8')
  const rows: string[][] = parse(raw, {
    delimiter: '\t',
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
    quote: false,
  })
  console.log(`Parsed ${rows.length} sentences\n`)

  // Step 5: Process with BATCH_SIZE
  const BATCH_SIZE = 500
  let processed = 0
  let inserted = 0
  let skipped = 0

  console.time('Processing time')

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    for (const row of batch) {
      const [, sentence, , translation] = row

      if (!sentence?.trim() || !translation?.trim()) {
        skipped++
        continue
      }

      const matchingWords = findWordsInSentence(sentence.trim(), wordIndex, wordMap)

      if (matchingWords.length === 0) {
        skipped++
        continue
      }

      // Limit to 3 words per sentence
      for (const word of matchingWords.slice(0, 3)) {
        em.persist(
          em.create(Example, {
            sentence: sentence.trim(),
            translation: translation.trim(),
            word: em.getReference(Word, word.id),
          }),
        )
        inserted++
      }

      processed++
    }

    await em.flush()
    em.clear()

    const percent = ((i + BATCH_SIZE) / rows.length * 100).toFixed(1)
    console.log(
      `[${percent}%] ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} | Inserted: ${inserted} | Skipped: ${skipped}`,
    )
  }

  console.timeEnd('Processing time')

  console.log('\n=== COMPLETE ===')
  console.log(`Sentences processed: ${processed}`)
  console.log(`Examples created: ${inserted}`)
  console.log(`Skipped (no match): ${skipped}`)

  await orm.close()
}

main().catch(console.error)

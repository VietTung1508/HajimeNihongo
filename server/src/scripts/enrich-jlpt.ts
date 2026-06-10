/**
 * enrich-jlpt.ts
 *
 * Tags Word rows with their JLPT level (1–5) using Jisho API.
 * Fetches all vocabulary for each JLPT level via:
 *   https://jisho.org/api/v1/search/words?keyword=%23jlpt-nX&page=N
 *
 * Fallback: if ./jlpt/nX.csv files exist (expression,reading,tags format),
 * those are used instead.
 *
 * Usage:
 *   npm run enrich:jlpt
 */

import fs from 'fs'
import path from 'path'
import * as https from 'https'
import * as http from 'http'
import {MikroORM} from '@mikro-orm/core'
import config from '../mikro-orm.config'
import {Word} from '../entities/Word'

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib
      .get(url, {headers: {'User-Agent': 'HajimeNihongo/1.0'}}, (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        }
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
        })
      })
      .on('error', reject)
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Jisho API ───────────────────────────────────────────────────────────────

interface JishoEntry {
  slug: string
  jlpt: string[]
  japanese: {word?: string; reading?: string}[]
}

interface JishoResponse {
  data: JishoEntry[]
}

async function fetchJishoLevel(level: number): Promise<{word: string; reading: string; jlpt: number}[]> {
  const keyword = encodeURIComponent(`#jlpt-n${level}`)
  const items: {word: string; reading: string; jlpt: number}[] = []
  let page = 1

  while (true) {
    const url = `https://jisho.org/api/v1/search/words?keyword=${keyword}&page=${page}`
    let resp: JishoResponse

    try {
      resp = await fetchJson(url) as JishoResponse
    } catch (err) {
      console.warn(`    page ${page} failed: ${(err as Error).message}`)
      break
    }

    if (!resp.data || resp.data.length === 0) break

    for (const entry of resp.data) {
      for (const jp of entry.japanese) {
        const word = jp.word?.trim() ?? ''
        const reading = jp.reading?.trim() ?? ''
        if (word || reading) {
          items.push({word: word || reading, reading: reading || word, jlpt: level})
        }
      }
    }

    process.stdout.write(`\r    N${level}: page ${page}, ${items.length} items...`)
    page++
    await sleep(300) // be polite to Jisho API
  }

  process.stdout.write('\n')
  return items
}

// ─── Legacy CSV format (expression,reading,tags) ─────────────────────────────

function parseLine(line: string, sep: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === sep && !inQuotes) {
      fields.push(current.trim()); current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function parseLegacyCsv(content: string): {word: string; reading: string; jlpt: number}[] {
  const lines = content.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const sep = lines[0].includes('\t') ? '\t' : ','
  const headers = parseLine(lines[0], sep).map(h => h.toLowerCase().trim())
  const expressionIdx = headers.indexOf('expression')
  const readingIdx = headers.indexOf('reading')
  const tagsIdx = headers.indexOf('tags')
  if (expressionIdx === -1 || tagsIdx === -1) return []

  const levelMap: Record<string, number> = {
    JLPT_N1: 1, JLPT_1: 1, JLPT_N2: 2, JLPT_2: 2,
    JLPT_N3: 3, JLPT_3: 3, JLPT_N4: 4, JLPT_4: 4,
    JLPT_N5: 5, JLPT_5: 5,
  }

  const items: {word: string; reading: string; jlpt: number}[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i], sep)
    const tags = cols[tagsIdx] ?? ''
    const jlpt = Object.entries(levelMap).find(([tag]) => tags.includes(tag))?.[1]
    if (!jlpt) continue
    items.push({
      word: cols[expressionIdx]?.trim() ?? '',
      reading: readingIdx >= 0 ? cols[readingIdx]?.trim() ?? '' : '',
      jlpt,
    })
  }
  return items
}

// ─── Main ────────────────────────────────────────────────────────────────────

const LOCAL_PATH = './jlpt'

async function run() {
  const orm = await MikroORM.init(config)
  const em = orm.em.fork()

  let allItems: {word: string; reading: string; jlpt: number}[] = []

  // Check local files first
  const hasLocalFiles = [1, 2, 3, 4, 5].every(n => fs.existsSync(path.join(LOCAL_PATH, `n${n}.csv`)))

  if (hasLocalFiles) {
    console.log('Loading from local CSV files...')
    for (const level of [5, 4, 3, 2, 1]) {
      const content = fs.readFileSync(path.join(LOCAL_PATH, `n${level}.csv`), 'utf8')
      const items = parseLegacyCsv(content)
      console.log(`  N${level}: ${items.length} items`)
      allItems = allItems.concat(items)
    }
  } else {
    console.log('Fetching JLPT vocabulary from Jisho API...')
    for (const level of [5, 4, 3, 2, 1]) {
      try {
        const items = await fetchJishoLevel(level)
        console.log(`  N${level}: ${items.length} items loaded`)
        allItems = allItems.concat(items)
      } catch (err) {
        console.error(`  N${level}: failed — ${(err as Error).message}`)
      }
    }
  }

  console.log(`\nTotal JLPT items: ${allItems.length}`)

  if (allItems.length === 0) {
    console.error('No data loaded. Aborting.')
    process.exit(1)
  }

  const words = await em.find(Word, {})
  const byKanji = new Map<string, Word>()
  const byReading = new Map<string, Word>()

  for (const w of words) {
    if (w.kanji) byKanji.set(w.kanji, w)
    byReading.set(w.reading, w)
  }

  console.log('Matching and updating words...')
  let updated = 0

  for (const item of allItems) {
    const word = byKanji.get(item.word) ?? byReading.get(item.reading) ?? byReading.get(item.word)
    if (!word || word.jlptLevel) continue
    word.jlptLevel = item.jlpt
    updated++
  }

  await em.begin()
  try {
    await em.flush()
    await em.commit()
    console.log(`Updated JLPT level on ${updated} words`)
  } catch (err) {
    await em.rollback()
    console.error('Transaction rolled back:', err)
    process.exit(1)
  }

  await orm.close(true)
  console.log('Done.')
}

run().catch(err => { console.error(err); process.exit(1) })

import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import {MikroORM} from '@mikro-orm/core'
import config from '../mikro-orm.config'
import {Word} from '../entities/Word'

type JLPTItem = {
  word: string
  reading: string
  jlpt: number | null
}

function extractJlptLevel(tags: string): number | null {
  if (!tags) return null

  if (tags.includes('JLPT_N1') || tags.includes('JLPT_1')) return 1
  if (tags.includes('JLPT_N2') || tags.includes('JLPT_2')) return 2
  if (tags.includes('JLPT_N3') || tags.includes('JLPT_3')) return 3
  if (tags.includes('JLPT_N4') || tags.includes('JLPT_4')) return 4
  if (tags.includes('JLPT_N5') || tags.includes('JLPT_5')) return 5

  return null
}

function loadCsv(filePath: string): Promise<JLPTItem[]> {
  return new Promise((resolve) => {
    const results: JLPTItem[] = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const jlpt = extractJlptLevel(data.tags)

        if (!jlpt) return

        results.push({
          word: data.expression?.trim(),
          reading: data.reading?.trim(),
          jlpt,
        })
      })
      .on('end', () => resolve(results))
  })
}

async function run() {
  const orm = await MikroORM.init(config)
  const em = orm.em.fork()

  console.log('Loading CSV files...')

  const basePath = './jlpt'

  const files = ['n1.csv', 'n2.csv', 'n3.csv', 'n4.csv', 'n5.csv']

  let allItems: JLPTItem[] = []

  for (const file of files) {
    const items = await loadCsv(path.join(basePath, file))
    allItems = allItems.concat(items)
  }

  console.log('Total JLPT items:', allItems.length)

  // ⚡ Load all words once (FAST)
  const words = await em.find(Word, {})
  const map = new Map<string, Word>()

  for (const w of words) {
    if (w.kanji) map.set(w.kanji, w)
    map.set(w.reading, w)
  }

  console.log('Updating database...')

  let updated = 0

  for (const item of allItems) {
    const word = map.get(item.word) || map.get(item.reading)

    if (!word) continue

    // ✅ only update if not already set
    if (!word.jlptLevel) {
      word.jlptLevel = item.jlpt!
      updated++
    }
  }

  await em.flush()

  console.log('Updated JLPT count:', updated)

  await orm.close(true)
}

run()

import fs from 'fs'
import {XMLParser} from 'fast-xml-parser'
import {MikroORM} from '@mikro-orm/core'
import config from '../mikro-orm.config'
import {Word} from '../entities/Word'

const normalizeArray = (item: any) => {
  if (!item) return []
  return Array.isArray(item) ? item : [item]
}

function isCommonEntry(entry: any): boolean {
  const kEle = normalizeArray(entry.k_ele)
  const rEle = normalizeArray(entry.r_ele)

  for (const k of kEle) {
    const pri = normalizeArray(k.ke_pri)
    if (pri.includes('ichi1') || pri.includes('news1')) return true
  }

  for (const r of rEle) {
    const pri = normalizeArray(r.re_pri)
    if (pri.includes('ichi1') || pri.includes('news1')) return true
  }

  return false
}

async function run() {
  const orm = await MikroORM.init(config)
  const em = orm.em.fork()

  console.log('Reading XML...')
  const xml = fs.readFileSync('JMdict_e.xml', 'utf-8')

  const parser = new XMLParser({
    ignoreAttributes: false,
    processEntities: false,
  })

  console.log('Parsing...')
  const data = parser.parse(xml)

  const entries = data.JMdict.entry

  console.log('Loading words from DB...')

  // ⚡ load all words once (FAST)
  const words = await em.find(Word, {})
  const map = new Map<string, Word>()

  for (const w of words) {
    if (w.kanji) map.set(w.kanji, w)
    map.set(w.reading, w)
  }

  console.log('Updating common words...')

  let updated = 0

  for (const entry of entries) {
    if (!isCommonEntry(entry)) continue

    const kanjiList = normalizeArray(entry.k_ele).map((k: any) => k.keb)
    const readingList = normalizeArray(entry.r_ele).map((r: any) => r.reb)

    const candidates = [...kanjiList, ...readingList]

    for (const c of candidates) {
      const word = map.get(c)
      if (!word) continue

      if (!word.isCommon) {
        word.isCommon = true
        updated++
      }

      break // stop after first match
    }
  }

  await em.flush()

  console.log('Updated common words:', updated)

  await orm.close(true)
}

run()

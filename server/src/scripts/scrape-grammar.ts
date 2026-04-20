/**
 * scrape-grammar.ts
 *
 * Downloads grammar point lists from J-O-S-H-L/grammar_dict (Bunpro scraped data).
 * Covers ALL JLPT levels: N5, N4, N3, N2, N1 (~915 grammar points total).
 *
 * Source:
 *   https://raw.githubusercontent.com/J-O-S-H-L/grammar_dict/main/scraper/grammar_points.json
 *
 * Output:
 *   n5.txt, n4.txt, n3.txt, n2.txt, n1.txt
 *   (Bunpro-compatible simple CSV format)
 *
 * Usage:
 *   ts-node src/scripts/scrape-grammar.ts
 */

import * as https from 'https'
import * as fs from 'fs'

// ─── HTTP ──────────────────────────────────────────────────────────────────

function download(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        res.on('error', reject)
      })
      .on('error', reject)
  })
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────

function escapeCsvField(value: string): string {
  if (!value) return ''
  const s = String(value).trim()
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function writeCsv(entries: any[], outputPath: string): void {
  const header =
    'grammar_point;meaning;level;lesson_number;lesson_title;bunpro_url;' +
    'structure;structure_display;part_of_speech;word_type;register;' +
    'about;cautions;example_jp_1;example_en_1;synonyms;antonyms;related;' +
    'meaning_hint;jp_hint\n'

  const rows = entries.map((e) => {
    const fields = [
      e.grammarPoint,
      e.meaning,
      e.level,
      e.lessonNumber,
      e.lessonTitle,
      e.bunproUrl,
      e.structure ?? '',
      e.structureDisplay ?? '',
      e.partOfSpeech ?? '',
      e.wordType ?? '',
      e.register ?? '',
      e.about ?? '',
      e.cautions ?? '',
      e.exampleJp ?? '',
      e.exampleEn ?? '',
      e.synonyms ?? '',
      e.antonyms ?? '',
      e.related ?? '',
      e.meaningHint ?? '',
      e.jpHint ?? '',
    ]
    return fields.map(escapeCsvField).join(';')
  })

  fs.writeFileSync(outputPath, header + rows.join('\n') + '\n', 'utf8')
  console.log(`  Wrote ${entries.length} rows → ${outputPath}`)
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function run() {
  const BASE = 'https://raw.githubusercontent.com/J-O-S-H-L/grammar_dict/main'
  const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

  console.log('Downloading grammar_points.json...\n')
  const raw = await download(`${BASE}/scraper/grammar_points.json`)
  const data: Record<string, Array<Record<string, string>>> = JSON.parse(raw)
  console.log('Loaded. Levels found:', Object.keys(data).join(', '), '\n')

  for (const level of LEVELS) {
    console.log(`=== ${level} ===`)
    const list: Array<Record<string, string>> = data[level]

    if (!list || !Array.isArray(list)) {
      console.log(`  No entries found for ${level}\n`)
      continue
    }

    console.log(`  ${list.length} grammar points`)

    // Group into ~18-per-lesson chunks (Bunpro uses ~10-20 per lesson)
    const entries = list.map((entry, i) => {
      const [grammarPoint, slug] = Object.entries(entry)[0]
      const lessonNumber = Math.floor(i / 18) + 1
      const url = `https://bunpro.jp/grammar_points/${slug}`

      return {
        grammarPoint,
        meaning: '',       // no meaning in this source — bunproUrl is reference
        level,
        lessonNumber,
        lessonTitle: '',
        bunproUrl: url,
        structure: '',
        structureDisplay: '',
        partOfSpeech: '',
        wordType: '',
        register: '',
        about: '',
        cautions: '',
        exampleJp: '',
        exampleEn: '',
        synonyms: '',
        antonyms: '',
        related: '',
        meaningHint: '',
        jpHint: '',
      }
    })

    writeCsv(entries, `${level.toLowerCase()}_full_sample.txt`)
    console.log('')
  }

  console.log('Done!')
  console.log('\nNext: npm run import:grammar  (after adding the new files to FILES array)')
  console.log('\nTo enrich with examples/meaning later, use build_full_sample.py')
  console.log('(requires Bunpro API access — N3/N2/N1 may require a paid account)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

import fs from 'fs'
import {parse} from 'csv-parse/sync'
import {MikroORM} from '@mikro-orm/core'
import {Example} from '../entities/Example'
import {Word} from '../entities/Word'
import mikroOrmConfig from '../mikro-orm.config'

async function main() {
  const orm = await MikroORM.init(mikroOrmConfig)
  const em = orm.em.fork()

  console.log('=== EXAMPLE DIAGNOSTIC REPORT ===\n')

  // Get all examples with their words
  const examples = await em.find(
    Example,
    {},
    {
      fields: ['id', 'sentence', 'translation'],
      populate: ['word'],
      limit: 100,
    },
  )

  console.log(`Checking first ${examples.length} examples...\n`)

  let correctMatches = 0
  let incorrectMatches = 0
  const mismatches: {
    exampleId: number
    wordId: number
    wordKanji: string | undefined
    wordReading: string
    sentence: string
    translation: string
  }[] = []

  for (const example of examples) {
    const word = example.word

    // Check if the word's kanji or reading appears in the sentence
    const kanji = word.kanji || ''
    const reading = word.reading

    const hasKanji = kanji && example.sentence.includes(kanji)
    const hasReading = example.sentence.includes(reading)

    if (hasKanji || hasReading) {
      correctMatches++
    } else {
      incorrectMatches++
      mismatches.push({
        exampleId: example.id,
        wordId: word.id,
        wordKanji: word.kanji,
        wordReading: word.reading,
        sentence: example.sentence,
        translation: example.translation,
      })
    }
  }

  console.log(`Correct matches: ${correctMatches}`)
  console.log(`Incorrect matches: ${incorrectMatches}`)
  console.log(`Accuracy: ${((correctMatches / examples.length) * 100).toFixed(2)}%\n`)

  if (mismatches.length > 0) {
    console.log('=== FIRST 10 MISMATCHES ===')
    mismatches.slice(0, 10).forEach((m, i) => {
      console.log(
        `\n${i + 1}. Word ID: ${m.wordId} | "${m.wordKanji || m.wordReading}"`,
      )
      console.log(`   Sentence: ${m.sentence}`)
      console.log(`   Translation: ${m.translation}`)
    })
  }

  console.log('\n=== RECOMMENDATION ===')
  console.log(
    'The import script incorrectly mapped Tasedict sentence IDs to JMdict entSeq values.',
  )
  console.log(
    'To fix: either delete all examples and re-import using proper word-matching,',
  )
  console.log(
    'or keep examples that match and delete only the incorrect ones.',
  )

  await orm.close()
}

main().catch(console.error)

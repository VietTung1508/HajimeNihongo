import {MikroORM} from '@mikro-orm/core'
import config from '../mikro-orm.config'

const isDryRun = !process.argv.includes('--confirm')

const TABLES_TO_COUNT = [
  'review_history', 'review_queue', 'daily_learn_item',
  'bookmark', 'user_word_progress', 'user_grammar_progress',
  'example', 'meaning', 'word', 'grammar_example', 'grammar',
]

async function countRows(conn: any): Promise<Record<string, number>> {
  // conn is MikroORM's internal connection; TS type not publicly exported
  const counts: Record<string, number> = {}
  for (const t of TABLES_TO_COUNT) {
    try {
      const rows = await conn.execute(`SELECT COUNT(*)::int AS n FROM "${t}"`)
      counts[t] = rows?.[0]?.n ?? 0
    } catch (err) {
      throw new Error(`Failed to count rows in table "${t}": ${err}`)
    }
  }
  return counts
}

async function run() {
  const orm = await MikroORM.init(config)
  const conn = orm.em.getConnection()

  console.log('\n--- Row counts ---')
  const before = await countRows(conn)
  for (const [table, count] of Object.entries(before)) {
    console.log(`  ${table}: ${count}`)
  }

  if (isDryRun) {
    console.log('\n[DRY RUN] No changes made. Pass --confirm to execute.')
    await orm.close(true)
    return
  }

  console.log('\nClearing content tables...')
  try {
    // NULL out nullable word/grammar FKs in user-linked tables.
    // review_history, review_queue, daily_learn_item, bookmark have nullable word_id/grammar_id.
    // After nullifying, these tables won't block deletion of word/grammar rows.
    await conn.execute(`UPDATE review_history SET word_id = NULL WHERE word_id IS NOT NULL`)
    await conn.execute(`UPDATE review_history SET grammar_id = NULL WHERE grammar_id IS NOT NULL`)
    await conn.execute(`UPDATE review_queue SET word_id = NULL WHERE word_id IS NOT NULL`)
    await conn.execute(`UPDATE review_queue SET grammar_id = NULL WHERE grammar_id IS NOT NULL`)
    await conn.execute(`UPDATE daily_learn_item SET word_id = NULL WHERE word_id IS NOT NULL`)
    await conn.execute(`UPDATE daily_learn_item SET grammar_id = NULL WHERE grammar_id IS NOT NULL`)
    await conn.execute(`DELETE FROM bookmark WHERE word_id IS NOT NULL OR grammar_id IS NOT NULL`)

    // Delete derived user progress rows (non-nullable FK — must go before word/grammar)
    // Pre-condition: all non-nullable FKs to word/grammar are in user_word_progress + user_grammar_progress only
    await conn.execute(`DELETE FROM user_word_progress`)
    await conn.execute(`DELETE FROM user_grammar_progress`)

    // Vocabulary chain
    await conn.execute(`DELETE FROM example`)
    await conn.execute(`DELETE FROM meaning`)
    await conn.execute(`DELETE FROM word`)

    // Grammar chain
    await conn.execute(`DELETE FROM grammar_example`)
    await conn.execute(`DELETE FROM grammar`)
  } catch (err) {
    console.error('ERROR: Failed to clear content:', err)
    await orm.close(true)
    process.exit(1)
  }

  console.log('\n--- Row counts after ---')
  const after = await countRows(conn)
  for (const [table, count] of Object.entries(after)) {
    console.log(`  ${table}: ${count}`)
  }

  console.log('\n✅ Done')
  await orm.close(true)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})

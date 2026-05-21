// server/src/controllers/admin-dashboard.controller.ts
import { Request, Response } from 'express'
import { DI } from '../utils/di'
import { User } from '../entities/User'
import { Word } from '../entities/Word'
import { Grammar } from '../entities/Grammar'
import { KanaSection } from '../entities/KanaSection'

function rowsToRecord(rows: Array<{ [k: string]: any }>, keyCol: string): Record<string, number> {
  return Object.fromEntries(rows.map(r => [String(r[keyCol]), Number(r.count)]))
}

function toNumber(val: unknown): number {
  return typeof val === 'string' ? parseInt(val, 10) : Number(val)
}

export async function getDashboard(_req: Request, res: Response) {
  try {
    const db = DI.em.getKnex()

    // Admin users = those with any entry in user_roles; exclude them from user counts
    const adminIdsResult = await db.select('user_id').from('user_roles').distinct()
    const adminIds: string[] = adminIdsResult.map((r: { user_id: string }) => r.user_id)

    const userFilter = adminIds.length > 0 ? { id: { $nin: adminIds } } : {}

    const [
      totalUsers, totalVocabulary, totalGrammar, totalKana, recentUsers,
      vocabByLevelRows, grammarByLevelRows,
      usersByTargetRows, studyPaceRows,
      topVocabRows, topGrammarRows,
    ] = await Promise.all([
      // --- existing ---
      DI.em.count(User, userFilter as any),
      DI.em.count(Word),
      DI.em.count(Grammar),
      DI.em.count(KanaSection),
      DI.em.find(User, userFilter as any, { orderBy: { createdAt: 'DESC' }, limit: 10 }),

      // --- new ---
      // word uses numeric jlpt_level (5=N5, 4=N4, ...), grammar uses string level ('N5', ...)
      db.select('jlpt_level').count('* as count').from('word').whereNotNull('jlpt_level').groupBy('jlpt_level'),
      db.select('level').count('* as count').from('grammar').whereNotNull('level').groupBy('level'),
      // user_onboarding uses `level` enum column (N5/N4/...), not jlpt_target
      db.select('level').count('* as count').from('user_onboarding').groupBy('level'),
      db.select('study_pace').count('* as count').from('user_onboarding').groupBy('study_pace'),

      db.select('w.id', 'w.kanji', 'w.reading')
        .count('b.id as bookmark_count')
        .from('bookmark as b')
        .join('word as w', 'b.word_id', 'w.id')
        .whereNotNull('b.word_id')
        .groupBy('w.id', 'w.kanji', 'w.reading')
        .orderBy('bookmark_count', 'desc')
        .limit(5),

      db.select('g.id', 'g.grammar_point', 'g.level')
        .count('b.id as bookmark_count')
        .from('bookmark as b')
        .join('grammar as g', 'b.grammar_id', 'g.id')
        .whereNotNull('b.grammar_id')
        .groupBy('g.id', 'g.grammar_point', 'g.level')
        .orderBy('bookmark_count', 'desc')
        .limit(5),
    ])

    res.json({
      stats: { totalUsers, totalVocabulary, totalGrammar, totalKana },
      recentAccounts: recentUsers.map((u: User) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        createdAt: u.createdAt,
      })),
      contentHealth: {
        // jlpt_level is numeric (5=N5, 4=N4, ...) — convert to 'N5' string keys for the frontend
        vocabByLevel: Object.fromEntries(
          vocabByLevelRows.map((r: any) => [`N${r.jlpt_level}`, Number(r.count)])
        ),
        grammarByLevel: rowsToRecord(grammarByLevelRows, 'level'),
      },
      learningInsights: {
        usersByJlptTarget: rowsToRecord(usersByTargetRows, 'level'),
        studyPaceDistribution: rowsToRecord(studyPaceRows, 'study_pace'),
      },
      topBookmarkedVocab: topVocabRows.map((r: any) => ({
        id: toNumber(r.id),
        kanji: r.kanji ?? null,
        reading: r.reading,
        count: toNumber(r.bookmark_count),
      })),
      topBookmarkedGrammar: topGrammarRows.map((r: any) => ({
        id: toNumber(r.id),
        grammarPoint: r.grammar_point,
        level: r.level,
        count: toNumber(r.bookmark_count),
      })),
    })
  } catch (error) {
    console.error('getDashboard error:', error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

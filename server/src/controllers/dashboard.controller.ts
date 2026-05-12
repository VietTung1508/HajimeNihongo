import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {ReviewHistory} from '../entities/ReviewHistory'
import {Word} from '../entities/Word'
import {Grammar} from '../entities/Grammar'
import {UserWordProgress} from '../entities/UserWordProgress'
import {UserGrammarProgress} from '../entities/UserGrammarProgress'
import {Streak} from '../entities/Streak'
import {DailyLearn} from '../entities/DailyLearn'
import {DailyLearnStatus} from '../enums/learn.enum'
import {User} from '../entities/User'

// Helper: Normalize JLPT level
function normalizeJlptLevel(level: string | number | undefined | null): string {
  if (!level) return 'N5'
  if (typeof level === 'number') {
    const mapping: Record<number, string> = {1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5'}
    return mapping[level] || 'N5'
  }
  const normalized = String(level).toUpperCase().trim()
  if (/^N[1-5]$/.test(normalized)) return normalized
  if (['N1', 'N2', 'N3', 'N4', 'N5'].includes(normalized)) return normalized
  return 'N5'
}

// GET /dashboard/activity
export const getActivity = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

    const startDateStr = req.query.startDate as string
    const endDateStr = req.query.endDate as string

    const now = new Date()
    let startDate: Date
    let endDate: Date

    // Default: last 7 days
    if (!startDateStr || !endDateStr) {
      endDate = new Date(now)
      endDate.setHours(23, 59, 59, 999)
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 6)
      startDate.setHours(0, 0, 0, 0)
    } else {
      startDate = new Date(startDateStr)
      endDate = new Date(endDateStr)

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({error: 'Invalid date format'})
      }

      if (startDate > endDate) {
        return res.status(400).json({error: 'startDate must be before or equal to endDate'})
      }

      const maxStart = new Date(now)
      maxStart.setDate(maxStart.getDate() - 90)
      if (startDate < maxStart) {
        return res.status(400).json({error: 'Date range cannot exceed 90 days'})
      }

      if (endDate > now) {
        return res.status(400).json({error: 'endDate cannot be in the future'})
      }
    }

    // Use MikroORM query builder
    const knex = em.getKnex()
    const result = await knex
      .select(knex.raw('DATE(reviewed_at) as date'))
      .select(knex.raw('COUNT(DISTINCT word_id) + COUNT(DISTINCT grammar_id) as count'))
      .from('review_history')
      .where('user_id', userId)
      .whereBetween('reviewed_at', [startDate, endDate])
      .groupByRaw('DATE(reviewed_at)')
      .orderByRaw('DATE(reviewed_at) ASC')
      .limit(365)

    // Knex returns array directly, not {rows}
    const data = (result || []).map((row: any) => ({
      date: row.date,
      count: parseInt(row.count) || 0
    }))

    res.json({data})
  } catch (error) {
    console.error('Error fetching activity:', error)
    res.status(500).json({error: 'Failed to fetch activity'})
  }
}

// GET /dashboard/weak-areas
export const getWeakAreas = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 50)

    // Single query with JOIN for better performance
    const knex = em.getKnex()

    // Get weak words
    const wordResult = await knex
      .select('rh.word_id as id')
      .select(knex.raw('COUNT(*) FILTER (WHERE is_correct) as correct_count'))
      .select(knex.raw('COUNT(*) as total_count'))
      .select('w.kanji', 'w.reading', 'w.id')
      .from('review_history as rh')
      .innerJoin('word as w', 'rh.word_id', 'w.id')
      .where('rh.user_id', userId)
      .groupBy('rh.word_id', 'w.id', 'w.kanji', 'w.reading')
      .havingRaw('COUNT(*) FILTER (WHERE is_correct) < COUNT(*) * 0.6')
      .limit(limit)

    // Get weak grammar
    const grammarResult = await knex
      .select('rh.grammar_id as id')
      .select(knex.raw('COUNT(*) FILTER (WHERE is_correct) as correct_count'))
      .select(knex.raw('COUNT(*) as total_count'))
      .select('g.grammar_point', 'g.meaning', 'g.id')
      .from('review_history as rh')
      .innerJoin('grammar as g', 'rh.grammar_id', 'g.id')
      .where('rh.user_id', userId)
      .groupBy('rh.grammar_id', 'g.id', 'g.grammar_point', 'g.meaning')
      .havingRaw('COUNT(*) FILTER (WHERE is_correct) < COUNT(*) * 0.6')
      .limit(limit)

    // Process results - Knex returns arrays directly
    const weakWords = (wordResult || []).map((row: any) => ({
      id: row.id,
      type: 'word' as const,
      accuracy: Math.round((row.correct_count / row.total_count) * 100),
      japanese: row.kanji || row.reading
    }))

    const weakGrammar = (grammarResult || []).map((row: any) => ({
      id: row.id,
      type: 'grammar' as const,
      accuracy: Math.round((row.correct_count / row.total_count) * 100),
      japanese: row.grammar_point
    }))

    const data = [...weakWords, ...weakGrammar]
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit)

    res.json({data})
  } catch (error) {
    console.error('Error fetching weak areas:', error)
    res.status(500).json({error: 'Failed to fetch weak areas'})
  }
}

// GET /dashboard/stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

    // Get or create streak
    let streak = await em.findOne(Streak, {user: userId})
    if (!streak) {
      const user = await em.findOne(User, userId)
      if (!user) {
        return res.status(404).json({error: 'User not found'})
      }

      streak = em.create(Streak, {
        user: userId,
        currentStreak: 0,
        longestStreak: 0,
        freezeAvailableAt: new Date(),
        freezesUsed: 0,
      })
      await em.persistAndFlush(streak)
    }

    // Get JLPT progress with proper eager loading
    const wordProgress = await em.find(UserWordProgress, {user: userId}, {
      populate: ['word']
    })
    const grammarProgress = await em.find(UserGrammarProgress, {user: userId}, {
      populate: ['grammar']
    })

    const jlptProgress: Record<string, {mastered: number; total: number}> = {
      N5: {mastered: 0, total: 0},
      N4: {mastered: 0, total: 0},
      N3: {mastered: 0, total: 0},
      N2: {mastered: 0, total: 0},
      N1: {mastered: 0, total: 0}
    }

    // Count mastered words
    for (const progress of wordProgress) {
      if (progress.word && progress.word.jlptLevel) {
        const level = normalizeJlptLevel(progress.word.jlptLevel)
        jlptProgress[level].mastered++
      }
    }

    // Get total counts from DB
    const wordCounts = await em.getKnex()
      .select('jlpt_level')
      .count('id as total')
      .from('word')
      .whereNotNull('jlpt_level')
      .groupBy('jlpt_level')

    for (const row of (wordCounts || [])) {
      const level = normalizeJlptLevel(row.jlpt_level)
      jlptProgress[level].total += parseInt(row.total)
    }

    // Count mastered grammar
    for (const progress of grammarProgress) {
      if (progress.grammar && progress.grammar.level) {
        const level = normalizeJlptLevel(progress.grammar.level)
        jlptProgress[level].mastered++
      }
    }

    // Get total grammar counts
    const grammarCounts = await em.getKnex()
      .select('level')
      .count('id as total')
      .from('grammar')
      .whereNotNull('level')
      .groupBy('level')

    for (const row of (grammarCounts || [])) {
      const level = normalizeJlptLevel(row.level)
      jlptProgress[level].total += parseInt(row.total)
    }

    // Days studied
    const activityDates = new Set<string>()

    const reviewDates = await em.getKnex()
      .distinct(em.getKnex().raw('DATE(reviewed_at) as date'))
      .from('review_history')
      .where('user_id', userId)

    for (const row of (reviewDates || [])) {
      activityDates.add(String(row.date))
    }

    const learnDates = await em.getKnex()
      .distinct('generated_date')
      .from('daily_learn')
      .where('user_id', userId)
      .where('status', DailyLearnStatus.COMPLETED)

    for (const row of (learnDates || [])) {
      activityDates.add(row.generated_date)
    }

    // Last session accuracy
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayReviews = await em.find(ReviewHistory, {
      user: userId,
      reviewedAt: {$gte: today}
    })

    let lastSessionAccuracy = 0
    let lastSessionDate: Date | null = null

    if (todayReviews.length > 0) {
      const correct = todayReviews.filter((r: ReviewHistory) => r.isCorrect).length
      lastSessionAccuracy = Math.round((correct / todayReviews.length) * 100)
      lastSessionDate = today
    } else {
      const recentReview = await em.findOne(ReviewHistory, {
        user: userId
      }, {
        orderBy: {reviewedAt: 'DESC'}
      })

      if (recentReview) {
        const sessionDate = new Date(recentReview.reviewedAt)
        sessionDate.setHours(0, 0, 0, 0)

        const sessionReviews = await em.find(ReviewHistory, {
          user: userId,
          reviewedAt: {$gte: sessionDate, $lt: new Date(sessionDate.getTime() + 86400000)}
        })

        if (sessionReviews.length > 0) {
          const correct = sessionReviews.filter((r: ReviewHistory) => r.isCorrect).length
          lastSessionAccuracy = Math.round((correct / sessionReviews.length) * 100)
        }
        lastSessionDate = sessionDate
      }
    }

    // Total items studied
    const totalWordsStudied = await em.count(UserWordProgress, {user: userId})
    const totalGrammarStudied = await em.count(UserGrammarProgress, {user: userId})
    const totalItemsStudied = totalWordsStudied + totalGrammarStudied

    res.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      jlptProgress,
      daysStudied: activityDates.size,
      lastSessionAccuracy,
      lastSessionDate,
      totalItemsStudied
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({error: 'Failed to fetch stats'})
  }
}

// POST /review/attempts
export const recordReviewAttempt = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {wordId, grammarId, isCorrect} = req.body

    // Validate
    if ((!wordId && !grammarId) || (wordId && grammarId)) {
      return res.status(400).json({error: 'Provide exactly one of wordId or grammarId'})
    }

    if (typeof isCorrect !== 'boolean') {
      return res.status(400).json({error: 'isCorrect must be a boolean'})
    }

    // Wrap in transaction for atomicity
    await em.transactional(async () => {
      let word = null
      let grammar = null

      if (wordId) {
        word = await em.findOne(Word, {id: wordId})
        if (!word) {
          throw new Error('Word not found')
        }
      }

      if (grammarId) {
        grammar = await em.findOne(Grammar, {id: grammarId})
        if (!grammar) {
          throw new Error('Grammar not found')
        }
      }

      const reviewHistory = em.create(ReviewHistory, {
        user: userId,
        word,
        grammar,
        isCorrect,
        reviewedAt: new Date()
      })

      await em.persistAndFlush(reviewHistory)
    })

    // Fetch created record to return
    const saved = await em.findOne(ReviewHistory, {
      user: userId,
      reviewedAt: {$ne: null}
    }, {
      orderBy: {reviewedAt: 'DESC'},
      limit: 1
    })

    res.json({
      id: saved!.id,
      reviewedAt: saved!.reviewedAt.toISOString()
    })
  } catch (error: any) {
    console.error('Error recording review attempt:', error)
    if (error.message === 'Word not found' || error.message === 'Grammar not found') {
      return res.status(404).json({error: error.message})
    }
    res.status(500).json({error: 'Failed to record review attempt'})
  }
}

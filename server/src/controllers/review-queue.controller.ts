import {Request, Response} from 'express'
import {ReviewQueue} from '../entities/ReviewQueue'
import {Word} from '../entities/Word'
import {Grammar} from '../entities/Grammar'
import {User} from '../entities/User'
import {UserWordProgress} from '../entities/UserWordProgress'
import {UserGrammarProgress} from '../entities/UserGrammarProgress'
import {DailyLearnItem} from '../entities/DailyLearnItem'
import {DI} from '../utils/di'
import {mirrorMasteredToDailyLearnItem} from './learn.controller'

interface ReviewQueueMutationResponse {
  added: number
  removed: number
  skipped: number
}

interface WordReviewItemResponse {
  id: number
  type: 'word'
  kanji: string | null
  reading: string
  meanings: string[]
  jlptLevel: number | null
  isCommon: boolean
}

interface GrammarReviewItemResponse {
  id: number
  type: 'grammar'
  grammarPoint: string
  meaning: string
  exampleJp: string
  exampleEn: string
}

type ReviewItemResponse = WordReviewItemResponse | GrammarReviewItemResponse

interface GetReviewItemsResponse {
  items: ReviewItemResponse[]
  total: number
  counts?: {
    word: number
    grammar: number
  }
}

export const getReviewItems = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const type = req.query.type as 'word' | 'grammar' | undefined

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    // Build where clause based on type filter
    const where: any = {user}
    if (type === 'word') {
      where.word = {$ne: null}
    } else if (type === 'grammar') {
      where.grammar = {$ne: null}
    }

    const reviewItems = await em.find(ReviewQueue, where, {
      populate: ['word', 'word.meanings', 'grammar'],
      orderBy: {createdAt: 'asc'},
    })

    const items: ReviewItemResponse[] = reviewItems.map((item: ReviewQueue) => {
      if (item.word) {
        const word = item.word
        return {
          id: word.id,
          type: 'word' as const,
          kanji: word.kanji ?? null,
          reading: word.reading,
          meanings: word.meanings.getItems().map((m: any) => m.text),
          jlptLevel: word.jlptLevel ?? null,
          isCommon: word.isCommon,
        }
      } else if (item.grammar) {
        const grammar = item.grammar
        return {
          id: grammar.id,
          type: 'grammar' as const,
          grammarPoint: grammar.grammarPoint,
          meaning: grammar.meaning,
          exampleJp: grammar.exampleJp ?? '',
          exampleEn: grammar.exampleEn ?? '',
        }
      }
      return null
    }).filter((item: ReviewItemResponse | null): item is ReviewItemResponse => item !== null)

    // Get counts by type
    const [, wordCount] = await em.findAndCount(ReviewQueue, {user, word: {$ne: null}})
    const [, grammarCount] = await em.findAndCount(ReviewQueue, {user, grammar: {$ne: null}})

    const response: GetReviewItemsResponse = {
      items,
      total: items.length,
      counts: {
        word: wordCount,
        grammar: grammarCount,
      },
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching review items:', error)
    res.status(500).json({error: 'Failed to fetch review items'})
  }
}

export const addWordToQueue = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const uniqueIds = Array.from(new Set(ids))

    const existing = await em.find(
      ReviewQueue,
      {user, word: {$in: uniqueIds}},
      {fields: ['word']},
    )
    const existingWordIds = new Set(
      existing
        .map((item: ReviewQueue) => item.word?.id)
        .filter((id: number | undefined): id is number => id !== undefined),
    )

    const newIds = uniqueIds.filter((id: number) => !existingWordIds.has(id))
    const words = await em.find(Word, newIds)

    const reviewItems = words.map((word: Word) =>
      em.create(ReviewQueue, {user, word, createdAt: new Date()}),
    )

    await em.persistAndFlush(reviewItems)

    const response: ReviewQueueMutationResponse = {
      added: reviewItems.length,
      removed: 0,
      skipped: existing.length,
    }

    res.json(response)
  } catch (error) {
    console.error('Error adding words to queue:', error)
    res.status(500).json({error: 'Failed to add words to queue'})
  }
}

export const removeWordFromQueue = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const reviewItems = await em.find(ReviewQueue, {
      user,
      word: {$in: ids},
    })

    const removed = reviewItems.length
    await em.removeAndFlush(reviewItems)

    const response: ReviewQueueMutationResponse = {
      added: 0,
      removed,
      skipped: 0,
    }

    res.json(response)
  } catch (error) {
    console.error('Error removing words from queue:', error)
    res.status(500).json({error: 'Failed to remove words from queue'})
  }
}

export const addGrammarToQueue = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const uniqueIds = Array.from(new Set(ids))

    const existing = await em.find(
      ReviewQueue,
      {user, grammar: {$in: uniqueIds}},
      {fields: ['grammar']},
    )
    const existingGrammarIds = new Set(
      existing
        .map((item: ReviewQueue) => item.grammar?.id)
        .filter((id: number | undefined): id is number => id !== undefined),
    )

    const newIds = uniqueIds.filter((id: number) => !existingGrammarIds.has(id))
    const grammars = await em.find(Grammar, newIds)

    const reviewItems = grammars.map((grammar: Grammar) =>
      em.create(ReviewQueue, {user, grammar, createdAt: new Date()}),
    )

    await em.persistAndFlush(reviewItems)

    const response: ReviewQueueMutationResponse = {
      added: reviewItems.length,
      removed: 0,
      skipped: existing.length,
    }

    res.json(response)
  } catch (error) {
    console.error('Error adding grammar to queue:', error)
    res.status(500).json({error: 'Failed to add grammar to queue'})
  }
}

export const removeGrammarFromQueue = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const reviewItems = await em.find(ReviewQueue, {
      user,
      grammar: {$in: ids},
    })

    const removed = reviewItems.length
    await em.removeAndFlush(reviewItems)

    const response: ReviewQueueMutationResponse = {
      added: 0,
      removed,
      skipped: 0,
    }

    res.json(response)
  } catch (error) {
    console.error('Error removing grammar from queue:', error)
    res.status(500).json({error: 'Failed to remove grammar from queue'})
  }
}

export const getQueuedIds = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const type = req.query.type as string

    let ids: number[] = []

    if (type === 'word') {
      const reviewItems = await em.find(
        ReviewQueue,
        {user: userId},
        {fields: ['word']},
      )
      ids = reviewItems
        .map((item: ReviewQueue) => item.word?.id)
        .filter((id: number | undefined): id is number => id !== undefined)
    } else if (type === 'grammar') {
      const reviewItems = await em.find(
        ReviewQueue,
        {user: userId},
        {fields: ['grammar']},
      )
      ids = reviewItems
        .map((item: ReviewQueue) => item.grammar?.id)
        .filter((id: number | undefined): id is number => id !== undefined)
    } else {
      return res.status(400).json({error: 'Invalid type'})
    }

    res.json({ids})
  } catch (error) {
    console.error('Error fetching queued IDs:', error)
    res.status(500).json({error: 'Failed to fetch queued IDs'})
  }
}

export const markWordAsMastered = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const words = await em.find(Word, ids)

    // Create or update progress records
    for (const word of words) {
      const existing = await em.findOne(UserWordProgress, {user, word})
      if (!existing) {
        const progress = em.create(UserWordProgress, {
          user,
          word,
          masteredAt: new Date(),
        })
        em.persist(progress)
      }
    }

    await em.flush()

    // Mirror to DailyLearnItem if applicable
    const dailyLearnItems = await em.find(DailyLearnItem, {
      word: {$in: ids},
      masteredAt: null,
    }, {
      populate: ['dailyLearn'],
    })

    for (const dailyLearnItem of dailyLearnItems) {
      await mirrorMasteredToDailyLearnItem(dailyLearnItem.id)
    }

    // Remove from review queue
    const reviewItems = await em.find(ReviewQueue, {
      user,
      word: {$in: ids},
    })

    await em.removeAndFlush(reviewItems)

    res.json({marked: words.length, removed: reviewItems.length})
  } catch (error) {
    console.error('Error marking words as mastered:', error)
    res.status(500).json({error: 'Failed to mark words as mastered'})
  }
}

export const markGrammarAsMastered = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const grammars = await em.find(Grammar, ids)

    // Create or update progress records
    for (const grammar of grammars) {
      const existing = await em.findOne(UserGrammarProgress, {user, grammar})
      if (!existing) {
        const progress = em.create(UserGrammarProgress, {
          user,
          grammar,
          masteredAt: new Date(),
        })
        em.persist(progress)
      }
    }

    await em.flush()

    // Mirror to DailyLearnItem if applicable
    const dailyLearnItems = await em.find(DailyLearnItem, {
      grammar: {$in: ids},
      masteredAt: null,
    }, {
      populate: ['dailyLearn'],
    })

    for (const dailyLearnItem of dailyLearnItems) {
      await mirrorMasteredToDailyLearnItem(dailyLearnItem.id)
    }

    // Remove from review queue
    const reviewItems = await em.find(ReviewQueue, {
      user,
      grammar: {$in: ids},
    })

    await em.removeAndFlush(reviewItems)

    res.json({marked: grammars.length, removed: reviewItems.length})
  } catch (error) {
    console.error('Error marking grammar as mastered:', error)
    res.status(500).json({error: 'Failed to mark grammar as mastered'})
  }
}

export const getMasteredIds = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const type = req.query.type as string

    let ids: number[] = []

    if (type === 'word') {
      const progressItems = await em.find(
        UserWordProgress,
        {user: userId},
        {fields: ['word']},
      )
      ids = progressItems
        .map((item: UserWordProgress) => item.word.id)
        .filter((id: number | undefined): id is number => id !== undefined)
    } else if (type === 'grammar') {
      const progressItems = await em.find(
        UserGrammarProgress,
        {user: userId},
        {fields: ['grammar']},
      )
      ids = progressItems
        .map((item: UserGrammarProgress) => item.grammar.id)
        .filter((id: number | undefined): id is number => id !== undefined)
    } else {
      return res.status(400).json({error: 'Invalid type'})
    }

    res.json({ids})
  } catch (error) {
    console.error('Error fetching mastered IDs:', error)
    res.status(500).json({error: 'Failed to fetch mastered IDs'})
  }
}

export const unmarkWordAsMastered = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const progressItems = await em.find(UserWordProgress, {
      user,
      word: {$in: ids},
    })

    const removed = progressItems.length
    await em.removeAndFlush(progressItems)

    res.json({unmarked: removed})
  } catch (error) {
    console.error('Error unmarking words as mastered:', error)
    res.status(500).json({error: 'Failed to unmark words as mastered'})
  }
}

export const unmarkGrammarAsMastered = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {ids} = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({error: 'Invalid ids'})
    }

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const progressItems = await em.find(UserGrammarProgress, {
      user,
      grammar: {$in: ids},
    })

    const removed = progressItems.length
    await em.removeAndFlush(progressItems)

    res.json({unmarked: removed})
  } catch (error) {
    console.error('Error unmarking grammar as mastered:', error)
    res.status(500).json({error: 'Failed to unmark grammar as mastered'})
  }
}

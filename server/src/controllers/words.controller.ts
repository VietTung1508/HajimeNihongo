 import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {Word} from '../entities/Word'
import {PlacementTestService} from '../services/placement-test.service'
import {LevelEnum} from '../enums/onboarding.enum'

export const getWordList = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const {
      q = '',
      sort = 'relevance',
      page = '1',
      limit = '24',
      commonOnly = 'false',
      level,
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 12))
    const offset = (pageNum - 1) * limitNum
    const isCommonOnly = commonOnly === 'true'

    const validSorts = ['relevance', 'highest_jlpt', 'lowest_jlpt']
    const sortOrder = validSorts.includes(sort as string) ? sort : 'relevance'

    const orderBy: Record<string, 'asc' | 'desc'> = {}
    if (sortOrder === 'highest_jlpt') {
      orderBy.jlptLevel = 'asc'
    } else if (sortOrder === 'lowest_jlpt') {
      orderBy.jlptLevel = 'desc'
    }

    // Get authenticated user ID from request (set by auth middleware)
    const userId = req.user?.id
    const placementTestService = new PlacementTestService(em)

    // Get unlocked levels for user
    const unlockedLevels = userId ? await placementTestService.getUnlockedLevels(userId) : []

    // Convert unlocked levels to JLPT numbers
    const unlockedJlptNumbers: (1 | 2 | 3 | 4 | 5)[] = unlockedLevels
      .map(level => {
        switch (level) {
          case LevelEnum.N5:
            return 5
          case LevelEnum.N4:
            return 4
          case LevelEnum.N3:
            return 3
          case LevelEnum.N2:
            return 2
          case LevelEnum.N1:
            return 1
          default:
            return null
        }
      })
      .filter((jlpt): jlpt is 1 | 2 | 3 | 4 | 5 => jlpt !== null)

    // Validate level filter if provided
    let requestedJlptLevel: 1 | 2 | 3 | 4 | 5 | null = null
    if (level && typeof level === 'string') {
      const levelNum = parseInt(level, 10) as 1 | 2 | 3 | 4 | 5
      if (!isNaN(levelNum) && levelNum >= 1 && levelNum <= 5) {
        // Check if user has unlocked this level
        if (unlockedJlptNumbers.includes(levelNum)) {
          requestedJlptLevel = levelNum
        } else {
          return res.status(403).json({message: `Level N${levelNum} is not unlocked`})
        }
      }
    }

    let data: Word[] = []
    let total = 0

    const searchTerm = (q as string || '').trim()

    if (!searchTerm) {
      // No search query - simple query with filters
      const where: Record<string, unknown> = {}

      // Explicit level filter: exact match only. No level: include un-tagged words alongside unlocked levels.
      if (requestedJlptLevel !== null) {
        where.jlptLevel = requestedJlptLevel
      } else if (unlockedJlptNumbers.length > 0) {
        where.$or = [{jlptLevel: {$in: unlockedJlptNumbers}}, {jlptLevel: null}]
      }

      if (isCommonOnly) {
        where.isCommon = true
      }

      ;[data, total] = await em.findAndCount(Word, where, {
        populate: ['meanings'],
        orderBy,
        limit: limitNum,
        offset,
      })
    } else {
      // Search query - use raw SQL for better control
      const term = `%${searchTerm}%`

      // Build the base query with commonOnly filter and level filter
      let baseWhere = '(w.kanji ILIKE ? OR w.reading ILIKE ? OR m.text ILIKE ?)'
      let params: Array<string | number> = [term, term, term]

      // Explicit level filter: exact match only. No level: include un-tagged words alongside unlocked levels.
      if (requestedJlptLevel !== null) {
        baseWhere += ' AND w.jlpt_level = ?'
        params.push(requestedJlptLevel)
      } else if (unlockedJlptNumbers.length > 0) {
        baseWhere += ` AND (w.jlpt_level IN (${unlockedJlptNumbers.map(() => '?').join(', ')}) OR w.jlpt_level IS NULL)`
        params.push(...unlockedJlptNumbers)
      }

      // Add commonOnly filter to WHERE clause
      if (isCommonOnly) {
        baseWhere += ' AND w.is_common = true'
      }

      // Get matching word IDs
      const knex = em.getKnex()
      const idsQuery = knex
        .distinct('w.id')
        .from('word as w')
        .leftJoin('meaning as m', 'w.id', '=', 'm.word_id')
        .whereRaw(baseWhere, params)

      const rawIds = await idsQuery

      const uniqueIds = rawIds.map((r: {id: number}) => r.id)
      total = uniqueIds.length

      const paginatedIds = uniqueIds.slice(offset, offset + limitNum)

      if (paginatedIds.length === 0) {
        return res.json({data: [], total, page: pageNum, limit: limitNum})
      }

      // Fetch full word data
      const where: Record<string, unknown> = {id: {$in: paginatedIds}}
      if (isCommonOnly) {
        where.isCommon = true
      }

      ;[data] = await em.findAndCount(Word, where, {
        populate: ['meanings'],
        orderBy,
      })

      // Maintain order from search results
      const dataMap = new Map(data.map(w => [w.id, w]))
      data = paginatedIds.map((id: number) => dataMap.get(id)!).filter(Boolean)
    }

    const wordDtos = data.map(word => ({
      id: word.id,
      kanji: word.kanji ?? null,
      reading: word.reading,
      meanings: word.meanings.toArray().map(m => m.text),
      jlptLevel: word.jlptLevel ?? null,
      isCommon: word.isCommon,
    }))

    res.json({
      data: wordDtos,
      total,
      page: pageNum,
      limit: limitNum,
    })
  } catch (error) {
    console.error('Failed to fetch word list:', error)
    res.status(500).json({message: 'Internal server error'})
  }
}

export const getWordDetail = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const em = DI.em

    const word = await em.findOne(
      Word,
      {id},
      {populate: ['meanings', 'examples']}
    )

    if (!word) {
      return res.status(404).json({message: 'Word not found'})
    }

    if (word.jlptLevel) {
      const userId = req.user?.id
      const placementTestService = new PlacementTestService(em)
      const unlockedLevels = userId ? await placementTestService.getUnlockedLevels(userId) : []
      const unlockedJlptNumbers = unlockedLevels
        .map((level) => {
          switch (level) {
            case LevelEnum.N5:
              return 5
            case LevelEnum.N4:
              return 4
            case LevelEnum.N3:
              return 3
            case LevelEnum.N2:
              return 2
            case LevelEnum.N1:
              return 1
            default:
              return null
          }
        })
        .filter((jlpt): jlpt is 1 | 2 | 3 | 4 | 5 => jlpt !== null)

      if (!unlockedJlptNumbers.includes(word.jlptLevel as 1 | 2 | 3 | 4 | 5)) {
        return res.status(403).json({message: `Level N${word.jlptLevel} is not unlocked`})
      }
    }

    // Defensive: ensure relationships are populated
    const meanings = word.meanings?.toArray() ?? []
    const examples = word.examples?.toArray() ?? []

    const wordDetail = {
      id: word.id,
      entSeq: word.entSeq,
      kanji: word.kanji ?? null,
      reading: word.reading,
      isCommon: word.isCommon,
      jlptLevel: word.jlptLevel ?? null,
      audioUrl: word.audioUrl ?? undefined,
      meanings: meanings.map((m: any) => ({
        id: m.id,
        text: m.text,
      })),
      examples: examples.map((e: any) => ({
        id: e.id,
        sentence: e.sentence,
        translation: e.translation,
        audioUrl: e.audioUrl ?? undefined,
      })),
    }

    res.json(wordDetail)
  } catch (error) {
    console.error('Failed to fetch word detail:', error)
    res.status(500).json({message: 'Internal server error'})
  }
}

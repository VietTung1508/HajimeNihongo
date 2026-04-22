import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {Word} from '../entities/Word'

export const getWordList = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const {
      q = '',
      sort = 'relevance',
      page = '1',
      limit = '24',
      commonOnly = 'false',
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

    let data: Word[] = []
    let total = 0

    const searchTerm = (q as string || '').trim()

    if (!searchTerm) {
      // No search query - simple query with filters
      const where: Record<string, unknown> = {}
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

      // Build the base query with commonOnly filter
      let baseWhere = 'w.kanji ILIKE ? OR w.reading ILIKE ? OR m.text ILIKE ?'
      let params: string[] = [term, term, term]

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

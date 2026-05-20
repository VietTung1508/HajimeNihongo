import { Request, Response } from 'express'
import { NotFoundError } from '@mikro-orm/core'
import { DI } from '../utils/di'
import { Grammar } from '../entities/Grammar'
import { GrammarExample } from '../entities/GrammarExample'

const VALID_GRAMMAR_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

function parseIntParam(value: string | string[], res: Response): number | null {
  const n = parseInt(value as string, 10)
  if (isNaN(n)) {
    res.status(400).json({ message: 'Invalid ID parameter' })
    return null
  }
  return n
}

export async function listGrammar(req: Request, res: Response) {
  try {
    const em = DI.em
    const { q = '', level, page = '1', limit = '24' } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 24))
    const offset = (pageNum - 1) * limitNum

    const where: Record<string, unknown> = {}
    const searchTerm = (q as string).trim()
    if (searchTerm) {
      where.$or = [
        { grammarPoint: { $ilike: `%${searchTerm}%` } },
        { meaning: { $ilike: `%${searchTerm}%` } },
      ]
    }
    if (level && typeof level === 'string' && (VALID_GRAMMAR_LEVELS as readonly string[]).includes(level)) {
      where.level = level
    }

    const [data, total] = await em.findAndCount(Grammar, where, {
      orderBy: { level: 'desc', id: 'asc' },
      limit: limitNum,
      offset,
    })

    // scope count query to current page's ids only
    const knex = em.getKnex()
    const ids = data.map((g: Grammar) => g.id)
    const countRows = ids.length
      ? await knex('grammar_example')
          .select('grammar_id')
          .count('id as count')
          .whereIn('grammar_id', ids)
          .groupBy('grammar_id')
      : []
    const countMap = new Map<number, number>(
      countRows.map((r: { grammar_id: number; count: string }) => [r.grammar_id, Number(r.count)])
    )

    return res.json({
      data: data.map((g: Grammar) => ({
        id: g.id,
        grammarPoint: g.grammarPoint,
        meaning: g.meaning,
        level: g.level,
        lessonNumber: g.lessonNumber ?? null,
        examplesCount: countMap.get(g.id) ?? 0,
      })),
      total,
      page: pageNum,
      limit: limitNum,
    })
  } catch (e) {
    console.error('listGrammar error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getGrammarDetail(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const grammar = await DI.em.findOne(Grammar, { id }, { populate: ['examples'] })
    if (!grammar) return res.status(404).json({ message: 'Grammar not found' })

    return res.json({
      id: grammar.id,
      grammarPoint: grammar.grammarPoint,
      meaning: grammar.meaning,
      level: grammar.level,
      lessonNumber: grammar.lessonNumber ?? null,
      lessonTitle: grammar.lessonTitle ?? null,
      structure: grammar.structure ?? null,
      structureDisplay: grammar.structureDisplay ?? null,
      partOfSpeech: grammar.partOfSpeech ?? null,
      register: grammar.register ?? null,
      about: grammar.about ?? null,
      exampleJp: grammar.exampleJp ?? null,
      exampleEn: grammar.exampleEn ?? null,
      synonyms: grammar.synonyms ?? null,
      antonyms: grammar.antonyms ?? null,
      meaningHint: grammar.meaningHint ?? null,
      examples: grammar.examples.toArray().map((e: GrammarExample) => ({
        id: e.id,
        sentence: e.sentence,
        translation: e.translation,
        audioUrl: e.audioUrl ?? null,
      })),
    })
  } catch (e) {
    console.error('getGrammarDetail error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function createGrammar(req: Request, res: Response) {
  try {
    const {
      grammarPoint, meaning, level,
      lessonNumber, lessonTitle, structure, structureDisplay,
      partOfSpeech, register, about, exampleJp, exampleEn,
      synonyms, antonyms, meaningHint
    } = req.body

    if (!grammarPoint || !meaning || !level) {
      return res.status(400).json({ message: 'grammarPoint, meaning, and level are required' })
    }

    if (!VALID_GRAMMAR_LEVELS.includes(level as typeof VALID_GRAMMAR_LEVELS[number])) {
      return res.status(400).json({ message: 'level must be one of N5, N4, N3, N2, N1' })
    }

    const em = DI.em
    const grammar = em.create(Grammar, {
      grammarPoint,
      meaning,
      level,
      ...(lessonNumber !== undefined && { lessonNumber }),
      ...(lessonTitle !== undefined && { lessonTitle }),
      ...(structure !== undefined && { structure }),
      ...(structureDisplay !== undefined && { structureDisplay }),
      ...(partOfSpeech !== undefined && { partOfSpeech }),
      ...(register !== undefined && { register }),
      ...(about !== undefined && { about }),
      ...(exampleJp !== undefined && { exampleJp }),
      ...(exampleEn !== undefined && { exampleEn }),
      ...(synonyms !== undefined && { synonyms }),
      ...(antonyms !== undefined && { antonyms }),
      ...(meaningHint !== undefined && { meaningHint }),
    })
    await em.persistAndFlush(grammar)
    return res.status(201).json({ id: grammar.id })
  } catch (e) {
    console.error('createGrammar error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateGrammar(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const em = DI.em
    const grammar = await em.findOneOrFail(Grammar, { id })
    const allowed = [
      'grammarPoint', 'meaning', 'level', 'lessonNumber', 'lessonTitle',
      'structure', 'structureDisplay', 'partOfSpeech', 'register', 'about',
      'exampleJp', 'exampleEn', 'synonyms', 'antonyms', 'meaningHint',
    ] as const

    if (req.body.level !== undefined) {
      if (!VALID_GRAMMAR_LEVELS.includes(req.body.level as typeof VALID_GRAMMAR_LEVELS[number])) {
        return res.status(400).json({ message: 'level must be one of N5, N4, N3, N2, N1' })
      }
    }

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (grammar as Record<string, unknown>)[key] = req.body[key]
      }
    }

    await em.flush()
    return res.json({ message: 'Updated', id: grammar.id })
  } catch (e) {
    if (e instanceof NotFoundError) return res.status(404).json({ message: 'Not found' })
    console.error('updateGrammar error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteGrammar(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const em = DI.em
    const exists = await em.count(Grammar, { id })
    if (!exists) return res.status(404).json({ message: 'Not found' })

    // Explicit child deletion — no Cascade.REMOVE on examples
    await em.nativeDelete(GrammarExample, { grammar: id })
    await em.nativeDelete(Grammar, { id })
    return res.status(204).send()
  } catch (e) {
    console.error('deleteGrammar error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function addGrammarExample(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const { sentence, translation, audioUrl } = req.body
    if (!sentence || !translation) {
      return res.status(400).json({ message: 'sentence and translation are required' })
    }

    const em = DI.em
    const grammar = await em.findOneOrFail(Grammar, { id })
    const example = em.create(GrammarExample, { sentence, translation, audioUrl, grammar })
    await em.persistAndFlush(example)
    return res.status(201).json({
      id: example.id,
      sentence: example.sentence,
      translation: example.translation,
      audioUrl: example.audioUrl ?? null,
    })
  } catch (e) {
    if (e instanceof NotFoundError) return res.status(404).json({ message: 'Not found' })
    console.error('addGrammarExample error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateGrammarExample(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return
    const eid = parseIntParam(req.params.eid, res)
    if (eid === null) return

    const em = DI.em
    const example = await em.findOneOrFail(GrammarExample, { id: eid, grammar: { id } })
    const { sentence, translation, audioUrl } = req.body

    if (sentence !== undefined) example.sentence = sentence
    if (translation !== undefined) example.translation = translation
    if (audioUrl !== undefined) example.audioUrl = audioUrl

    await em.flush()
    return res.json({
      id: example.id,
      sentence: example.sentence,
      translation: example.translation,
      audioUrl: example.audioUrl ?? null,
    })
  } catch (e) {
    if (e instanceof NotFoundError) return res.status(404).json({ message: 'Not found' })
    console.error('updateGrammarExample error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteGrammarExample(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return
    const eid = parseIntParam(req.params.eid, res)
    if (eid === null) return

    const em = DI.em
    const example = await em.findOneOrFail(GrammarExample, { id: eid, grammar: { id } })
    await em.removeAndFlush(example)
    return res.status(204).send()
  } catch (e) {
    if (e instanceof NotFoundError) return res.status(404).json({ message: 'Not found' })
    console.error('deleteGrammarExample error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

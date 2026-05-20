import { Request, Response } from 'express'
import { NotFoundError, QueryOrder } from '@mikro-orm/core'
import type { Knex } from 'knex'
import { DI } from '../utils/di'
import { Word } from '../entities/Word'
import { Meaning } from '../entities/Meaning'
import { Example } from '../entities/Example'

export async function createVocabulary(req: Request, res: Response) {
  try {
    const em = DI.em
    const { kanji, reading, jlptLevel, isCommon = false, meanings = [] } = req.body

    if (!reading?.trim()) {
      return res.status(400).json({ message: 'reading is required' })
    }
    if (!Array.isArray(meanings) || !meanings.some((m: unknown) => typeof m === 'string' && (m as string).trim())) {
      return res.status(400).json({ message: 'At least one meaning is required' })
    }

    const word = em.create(Word, {
      entSeq: Date.now(),
      reading: reading.trim(),
      kanji: kanji?.trim() || undefined,
      jlptLevel: jlptLevel != null ? Number(jlptLevel) : undefined,
      isCommon: isCommon === true || isCommon === 'true',
    })
    await em.persistAndFlush(word)

    for (const text of meanings) {
      if (typeof text === 'string' && text.trim()) {
        em.persist(em.create(Meaning, { word, text: text.trim() }))
      }
    }
    await em.flush()
    await em.populate(word, ['meanings', 'examples'])

    return res.status(201).json({
      id: word.id,
      entSeq: word.entSeq,
      kanji: word.kanji ?? null,
      reading: word.reading,
      jlptLevel: word.jlptLevel ?? null,
      isCommon: word.isCommon,
      audioUrl: word.audioUrl ?? null,
      meanings: word.meanings.getItems().map((m: Meaning) => ({ id: m.id, text: m.text })),
      examples: [],
    })
  } catch (e) {
    console.error('createVocabulary error:', e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function deleteVocabulary(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const knex = DI.em.getKnex()
    await knex.transaction(async (trx: Knex.Transaction) => {
      await trx('bookmark').where('word_id', id).update({ word_id: null })
      await trx('daily_learn_item').where('word_id', id).update({ word_id: null })
      await trx('review_history').where('word_id', id).update({ word_id: null })
      await trx('review_queue').where('word_id', id).update({ word_id: null })
      await trx('user_word_progress').where('word_id', id).delete()
      await trx('meaning').where('word_id', id).delete()
      await trx('example').where('word_id', id).delete()
      await trx('word').where('id', id).delete()
    })

    return res.status(204).send()
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('deleteVocabulary error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

function parseIntParam(value: string | string[], res: Response): number | null {
  const n = parseInt(value as string, 10)
  if (isNaN(n)) {
    res.status(400).json({ message: 'Invalid ID parameter' })
    return null
  }
  return n
}

export async function listVocabulary(req: Request, res: Response) {
  try {
    const em = DI.em
    const { q = '', level, commonOnly = 'false', page = '1', limit = '24' } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 24))
    const offset = (pageNum - 1) * limitNum
    const isCommonOnly = commonOnly === 'true'

    let requestedJlptLevel: number | null = null
    if (level && typeof level === 'string') {
      const lvl = parseInt(level, 10)
      if (!isNaN(lvl) && lvl >= 1 && lvl <= 5) {
        requestedJlptLevel = lvl
      }
    }

    let data: Word[] = []
    let total = 0
    const searchTerm = (q as string).trim()

    if (!searchTerm) {
      const where: Record<string, unknown> = {}
      if (requestedJlptLevel !== null) where.jlptLevel = requestedJlptLevel
      if (isCommonOnly) where.isCommon = true

      ;[data, total] = await em.findAndCount(Word, where, {
        populate: ['meanings'],
        orderBy: { jlptLevel: QueryOrder.DESC_NULLS_LAST, id: QueryOrder.ASC },
        limit: limitNum,
        offset,
      })
    } else {
      const term = `%${searchTerm}%`
      let baseWhere = '(w.kanji ILIKE ? OR w.reading ILIKE ? OR m.text ILIKE ?)'
      const params: Array<string | number> = [term, term, term]

      if (requestedJlptLevel !== null) {
        baseWhere += ' AND w.jlpt_level = ?'
        params.push(requestedJlptLevel)
      }
      if (isCommonOnly) {
        baseWhere += ' AND w.is_common = true'
      }

      const knex = em.getKnex()
      const baseQuery = knex
        .distinct('w.id')
        .from('word as w')
        .leftJoin('meaning as m', 'w.id', '=', 'm.word_id')
        .whereRaw(baseWhere, params)

      const countRow = await knex
        .count('* as count')
        .from(baseQuery.clone().as('sub'))
      total = Number(countRow[0].count)

      if (total === 0) {
        return res.json({ data: [], total, page: pageNum, limit: limitNum })
      }

      const rawIds = await baseQuery.orderByRaw('w.jlpt_level DESC NULLS LAST, w.id ASC').limit(limitNum).offset(offset)
      const paginatedIds = rawIds.map((r: { id: number }) => r.id)

      if (paginatedIds.length === 0) {
        return res.json({ data: [], total, page: pageNum, limit: limitNum })
      }

      ;[data] = await em.findAndCount(Word, { id: { $in: paginatedIds } }, {
        populate: ['meanings'],
      })

      const dataMap = new Map(data.map(w => [w.id, w]))
      data = paginatedIds.map((id: number) => dataMap.get(id)!).filter(Boolean)
    }

    return res.json({
      data: data.map(word => ({
        id: word.id,
        kanji: word.kanji ?? null,
        reading: word.reading,
        meanings: word.meanings.toArray().map((m: any) => ({ id: m.id, text: m.text })),
        jlptLevel: word.jlptLevel ?? null,
        isCommon: word.isCommon,
      })),
      total,
      page: pageNum,
      limit: limitNum,
    })
  } catch (e) {
    console.error('listVocabulary error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getVocabularyDetail(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const word = await DI.em.findOne(Word, { id }, { populate: ['meanings', 'examples'] })
    if (!word) return res.status(404).json({ message: 'Word not found' })

    return res.json({
      id: word.id,
      entSeq: word.entSeq,
      kanji: word.kanji ?? null,
      reading: word.reading,
      isCommon: word.isCommon,
      jlptLevel: word.jlptLevel ?? null,
      audioUrl: word.audioUrl ?? null,
      meanings: word.meanings.toArray().map((m: any) => ({ id: m.id, text: m.text })),
      examples: word.examples.toArray().map((e: any) => ({
        id: e.id,
        sentence: e.sentence,
        translation: e.translation,
        audioUrl: e.audioUrl ?? null,
      })),
    })
  } catch (e) {
    console.error('getVocabularyDetail error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateVocabulary(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const em = DI.em
    const word = await em.findOneOrFail(Word, { id })
    const { jlptLevel, isCommon, audioUrl } = req.body

    if (jlptLevel !== undefined) {
      if (jlptLevel === null) {
        word.jlptLevel = undefined
      } else {
        const lvl = typeof jlptLevel === 'number' ? jlptLevel : parseInt(jlptLevel, 10)
        if (isNaN(lvl) || lvl < 1 || lvl > 5) {
          return res.status(400).json({ message: 'jlptLevel must be 1–5' })
        }
        word.jlptLevel = lvl
      }
    }
    if (isCommon !== undefined) {
      if (typeof isCommon !== 'boolean') {
        return res.status(400).json({ message: 'isCommon must be boolean' })
      }
      word.isCommon = isCommon
    }
    if (audioUrl !== undefined) {
      if (audioUrl !== null && typeof audioUrl !== 'string') {
        return res.status(400).json({ message: 'audioUrl must be a string or null' })
      }
      word.audioUrl = audioUrl ?? undefined
    }

    await em.flush()
    return res.json({ message: 'Updated', id: word.id })
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('updateVocabulary error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function addMeaning(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const { text } = req.body
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text is required' })
    }

    const em = DI.em
    const word = await em.findOneOrFail(Word, { id })
    const meaning = em.create(Meaning, { text, word })
    await em.persistAndFlush(meaning)
    return res.status(201).json({ id: meaning.id, text: meaning.text })
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('addMeaning error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateMeaning(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return
    const mid = parseIntParam(req.params.mid, res)
    if (mid === null) return

    const { text } = req.body
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text is required' })
    }

    const em = DI.em
    const meaning = await em.findOneOrFail(Meaning, { id: mid, word: { id } })
    meaning.text = text
    await em.flush()
    return res.json({ id: meaning.id, text: meaning.text })
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('updateMeaning error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteMeaning(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return
    const mid = parseIntParam(req.params.mid, res)
    if (mid === null) return

    const em = DI.em
    const meaning = await em.findOneOrFail(Meaning, { id: mid, word: { id } })
    await em.removeAndFlush(meaning)
    return res.status(204).send()
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('deleteMeaning error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function addExample(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return

    const { sentence, translation, audioUrl } = req.body
    if (!sentence || !translation) {
      return res.status(400).json({ message: 'sentence and translation are required' })
    }

    const em = DI.em
    const word = await em.findOneOrFail(Word, { id })
    const example = em.create(Example, { sentence, translation, audioUrl, word })
    await em.persistAndFlush(example)
    return res.status(201).json({
      id: example.id,
      sentence: example.sentence,
      translation: example.translation,
      audioUrl: example.audioUrl ?? null,
    })
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('addExample error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateExample(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return
    const eid = parseIntParam(req.params.eid, res)
    if (eid === null) return

    const em = DI.em
    const example = await em.findOneOrFail(Example, { id: eid, word: { id } })
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
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('updateExample error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteExample(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id, res)
    if (id === null) return
    const eid = parseIntParam(req.params.eid, res)
    if (eid === null) return

    const em = DI.em
    const example = await em.findOneOrFail(Example, { id: eid, word: { id } })
    await em.removeAndFlush(example)
    return res.status(204).send()
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ message: 'Not found' })
    }
    console.error('deleteExample error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

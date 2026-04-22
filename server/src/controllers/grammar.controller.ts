import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {Grammar} from '../entities/Grammar'
import {GrammarExample} from '../entities/GrammarExample'

export const getGrammarList = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const {level, lesson} = req.query as {level?: string; lesson?: string}

    const validLevels = ['N5', 'N4', 'N3', 'N2', 'N1']
    if (level && !validLevels.includes(level)) {
      return res.status(400).json({error: 'Invalid level'})
    }

    const where: Record<string, unknown> = {}
    if (level) where.level = level
    if (lesson) where.lessonNumber = Number(lesson)

    const [data, total] = await em.findAndCount(
      Grammar,
      where,
      {orderBy: [{lessonNumber: 'asc'}, {id: 'asc'}]},
    )

    res.json({data, total})
  } catch (error) {
    console.error('Failed to fetch grammar list:', error)
    res.status(500).json({message: 'Internal server error'})
  }
}

export const searchGrammar = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const {q} = req.query as {q?: string}

    if (!q || q.trim() === '') {
      return res.status(400).json({error: 'Missing q parameter'})
    }

    const term = q.trim()

    const conditions = [
      {grammarPoint: {$ilike: `%${term}%`}},
    ]

    const [data, total] = await em.findAndCount(
      Grammar,
      {$or: conditions},
      {orderBy: [{level: 'asc'}, {lessonNumber: 'asc'}, {id: 'asc'}], limit: 50},
    )

    res.json({data, total})
  } catch (error) {
    console.error('Failed to search grammar:', error)
    res.status(500).json({message: 'Internal server error'})
  }
}

export const getGrammarDetail = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const {id} = req.params

    const grammar = await em.findOne(
      Grammar,
      {id: Number(id)},
      {populate: ['examples']},
    )
    if (!grammar) {
      return res.status(404).json({message: 'Grammar point not found'})
    }

    res.json(grammar)
  } catch (error) {
    console.error('Failed to fetch grammar detail:', error)
    res.status(500).json({message: 'Internal server error'})
  }
}

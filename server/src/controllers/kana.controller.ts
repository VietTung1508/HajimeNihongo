import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {KanaSection} from '../entities/KanaSection'

export const getKanaSections = async (_req: Request, res: Response) => {
  try {
    const em = DI.em

    const [hiragana, katakana] = await Promise.all([
      em.find(KanaSection, {type: 'hiragana'}, {orderBy: {order: 'asc'}}),
      em.find(KanaSection, {type: 'katakana'}, {orderBy: {order: 'asc'}}),
    ])

    res.json({hiragana, katakana})
  } catch (error) {
    console.error('Failed to fetch kana sections:', error)
    res.status(500).json({message: 'Internal server error'})
  }
}

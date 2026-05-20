// server/src/controllers/admin-kana.controller.ts
import { Request, Response } from 'express'
import { NotFoundError } from '@mikro-orm/core'
import { DI } from '../utils/di'
import { KanaSection } from '../entities/KanaSection'
import cloudinary from '../utils/cloudinary'

const VALID_TYPES = ['hiragana', 'katakana'] as const

function parseIntParam(value: string, res: Response): number | null {
  const n = parseInt(value, 10)
  if (isNaN(n)) {
    res.status(400).json({ message: 'Invalid ID parameter' })
    return null
  }
  return n
}

export async function listKana(req: Request, res: Response) {
  try {
    const em = DI.em
    const sections = await em.findAll(KanaSection, { orderBy: { order: 'asc' } })
    const hiragana = sections.filter((s: KanaSection) => s.type === 'hiragana')
    const katakana = sections.filter((s: KanaSection) => s.type === 'katakana')
    return res.json({ hiragana, katakana })
  } catch (e) {
    console.error('listKana error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function getKanaById(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id as string, res)
    if (id === null) return

    const section = await DI.em.findOne(KanaSection, { id })
    if (!section) return res.status(404).json({ message: 'Kana section not found' })
    return res.json(section)
  } catch (e) {
    console.error('getKanaById error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function createKana(req: Request, res: Response) {
  try {
    const { type, title, content, order } = req.body
    if (!type || !title || content === undefined || order === undefined) {
      return res.status(400).json({ message: 'type, title, content, and order are required' })
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: 'type must be hiragana or katakana' })
    }

    const em = DI.em
    const section = em.create(KanaSection, { type, title, content, order: Number(order) })
    await em.persistAndFlush(section)
    return res.status(201).json(section)
  } catch (e) {
    console.error('createKana error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function updateKana(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id as string, res)
    if (id === null) return

    const em = DI.em
    const section = await em.findOneOrFail(KanaSection, { id })
    const { type, title, content, order } = req.body

    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ message: 'type must be hiragana or katakana' })
      }
      section.type = type
    }
    if (title !== undefined) section.title = title
    if (content !== undefined) section.content = content
    if (order !== undefined) section.order = Number(order)

    await em.flush()
    return res.json(section)
  } catch (e) {
    if (e instanceof NotFoundError) return res.status(404).json({ message: 'Not found' })
    console.error('updateKana error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function deleteKana(req: Request, res: Response) {
  try {
    const id = parseIntParam(req.params.id as string, res)
    if (id === null) return

    const em = DI.em
    const exists = await em.count(KanaSection, { id })
    if (!exists) return res.status(404).json({ message: 'Not found' })

    await em.nativeDelete(KanaSection, { id })
    return res.status(204).send()
  } catch (e) {
    console.error('deleteKana error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function uploadKanaImage(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' })
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'kana', resource_type: 'image' },
        (err, result) => {
          if (err || !result) reject(err)
          else resolve(result as { secure_url: string })
        },
      )
      stream.end(req.file!.buffer)
    })
    return res.json({ url: result.secure_url })
  } catch {
    return res.status(500).json({ message: 'Image upload failed' })
  }
}

export async function reorderKana(req: Request, res: Response) {
  try {
    const { sections } = req.body as { sections: { id: number; order: number }[] }
    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: 'sections array is required' })
    }

    const em = DI.em
    await Promise.all(
      sections.map(({ id, order }) =>
        em.nativeUpdate(KanaSection, { id }, { order })
      )
    )
    return res.status(204).send()
  } catch (e) {
    console.error('reorderKana error:', e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

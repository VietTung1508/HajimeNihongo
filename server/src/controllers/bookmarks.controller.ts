import {Request, Response} from 'express'
import {Bookmark} from '../entities/Bookmark'
import {Word} from '../entities/Word'
import {Grammar} from '../entities/Grammar'
import {User} from '../entities/User'
import {DI} from '../utils/di'

interface BookmarkMutationResponse {
  added: number
  removed: number
  skipped: number
}

interface WordBookmarkResponse {
  id: number
  kanji: string | null
  reading: string
  meanings: string[]
  jlptLevel: number | null
  isCommon: boolean
  bookmarkedAt: Date
}

interface GrammarBookmarkResponse {
  id: number
  grammarPoint: string
  meaning: string
  level: string
  lessonNumber: number | null
  bookmarkedAt: Date
}

export const getWordBookmarks = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const search = (req.query.search as string) || ''
    const sort = (req.query.sort as string) || 'newest'
    const offset = (page - 1) * limit

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const where: any = {user}
    const populate: string[] = ['word', 'word.meanings']

    const orderBy: any =
      sort === 'oldest' ? {createdAt: 'asc'} : {createdAt: 'desc'}

    const [bookmarks, total] = await em.findAndCount(Bookmark, where, {
      populate,
      orderBy,
      limit,
      offset,
    })

    let data: WordBookmarkResponse[] = bookmarks
      .filter((b: Bookmark) => b.word)
      .map((b: Bookmark) => {
        const word = b.word!
        return {
          id: word.id,
          kanji: word.kanji ?? null,
          reading: word.reading,
          meanings: word.meanings.getItems().map((m: any) => m.text),
          jlptLevel: word.jlptLevel ?? null,
          isCommon: word.isCommon,
          bookmarkedAt: b.createdAt,
        }
      })

    if (search) {
      const s = search.toLowerCase()
      data = data.filter((item: WordBookmarkResponse) => {
        return (
          (item.kanji && item.kanji.toLowerCase().includes(s)) ||
          item.reading.toLowerCase().includes(s) ||
          item.meanings.some((m: string) => m.toLowerCase().includes(s))
        )
      })
    }

    res.json({
      data,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Error fetching word bookmarks:', error)
    res.status(500).json({error: 'Failed to fetch bookmarks'})
  }
}

export const getGrammarBookmarks = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 12
    const search = (req.query.search as string) || ''
    const sort = (req.query.sort as string) || 'newest'
    const offset = (page - 1) * limit

    const user = await em.findOne(User, userId)
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const where: any = {user}
    const populate: string[] = ['grammar']

    const orderBy: any =
      sort === 'oldest' ? {createdAt: 'asc'} : {createdAt: 'desc'}

    const [bookmarks, total] = await em.findAndCount(Bookmark, where, {
      populate,
      orderBy,
      limit,
      offset,
    })

    let data: GrammarBookmarkResponse[] = bookmarks
      .filter((b: Bookmark) => b.grammar)
      .map((b: Bookmark) => {
        const grammar = b.grammar!
        return {
          id: grammar.id,
          grammarPoint: grammar.grammarPoint,
          meaning: grammar.meaning,
          level: grammar.level,
          lessonNumber: grammar.lessonNumber ?? null,
          bookmarkedAt: b.createdAt,
        }
      })

    if (search) {
      const s = search.toLowerCase()
      data = data.filter((item: GrammarBookmarkResponse) => {
        return (
          item.grammarPoint.toLowerCase().includes(s) ||
          item.meaning.toLowerCase().includes(s)
        )
      })
    }

    res.json({
      data,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Error fetching grammar bookmarks:', error)
    res.status(500).json({error: 'Failed to fetch bookmarks'})
  }
}

export const getBookmarkedIds = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const type = req.query.type as string

    let ids: number[] = []

    if (type === 'word') {
      const bookmarks = await em.find(
        Bookmark,
        {user: userId},
        {fields: ['word']},
      )
      ids = bookmarks
        .map((b: Bookmark) => b.word?.id)
        .filter((id: number | undefined): id is number => id !== undefined)
    } else if (type === 'grammar') {
      const bookmarks = await em.find(
        Bookmark,
        {user: userId},
        {fields: ['grammar']},
      )
      ids = bookmarks
        .map((b: Bookmark) => b.grammar?.id)
        .filter((id: number | undefined): id is number => id !== undefined)
    } else {
      return res.status(400).json({error: 'Invalid type'})
    }

    res.json({ids})
  } catch (error) {
    console.error('Error fetching bookmarked IDs:', error)
    res.status(500).json({error: 'Failed to fetch bookmarked IDs'})
  }
}

export const addWordBookmarks = async (req: Request, res: Response) => {
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

    const uniqueIds = [...new Set(ids)]

    const existing = await em.find(
      Bookmark,
      {user, word: uniqueIds},
      {fields: ['word']},
    )
    const existingWordIds = new Set(
      existing
        .map((b: Bookmark) => b.word?.id)
        .filter((id: number | undefined): id is number => id !== undefined),
    )

    const newIds = uniqueIds.filter((id: number) => !existingWordIds.has(id))
    const words = await em.find(Word, newIds)

    const bookmarks = words.map((word: Word) =>
      em.create(Bookmark, {user, word, createdAt: new Date()}),
    )

    await em.persistAndFlush(bookmarks)

    res.json({added: bookmarks.length, removed: 0, skipped: existing.length})
  } catch (error) {
    console.error('Error adding word bookmarks:', error)
    res.status(500).json({error: 'Failed to add bookmarks'})
  }
}

export const removeWordBookmarks = async (req: Request, res: Response) => {
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

    const bookmarks = await em.find(Bookmark, {
      user,
      word: ids,
    })

    const removed = bookmarks.length
    await em.removeAndFlush(bookmarks)

    res.json({added: 0, removed, skipped: 0})
  } catch (error) {
    console.error('Error removing word bookmarks:', error)
    res.status(500).json({error: 'Failed to remove bookmarks'})
  }
}

export const addGrammarBookmarks = async (req: Request, res: Response) => {
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

    const uniqueIds = [...new Set(ids)]

    const existing = await em.find(
      Bookmark,
      {user, grammar: uniqueIds},
      {fields: ['grammar']},
    )
    const existingGrammarIds = new Set(
      existing
        .map((b: Bookmark) => b.grammar?.id)
        .filter((id: number | undefined): id is number => id !== undefined),
    )

    const newIds = uniqueIds.filter((id: number) => !existingGrammarIds.has(id))
    const grammars = await em.find(Grammar, newIds)

    const bookmarks = grammars.map((grammar: Grammar) =>
      em.create(Bookmark, {user, grammar, createdAt: new Date()}),
    )

    await em.persistAndFlush(bookmarks)

    res.json({added: bookmarks.length, removed: 0, skipped: existing.length})
  } catch (error) {
    console.error('Error adding grammar bookmarks:', error)
    res.status(500).json({error: 'Failed to add bookmarks'})
  }
}

export const removeGrammarBookmarks = async (req: Request, res: Response) => {
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

    const bookmarks = await em.find(Bookmark, {
      user,
      grammar: ids,
    })

    const removed = bookmarks.length
    await em.removeAndFlush(bookmarks)

    res.json({added: 0, removed, skipped: 0})
  } catch (error) {
    console.error('Error removing grammar bookmarks:', error)
    res.status(500).json({error: 'Failed to remove bookmarks'})
  }
}

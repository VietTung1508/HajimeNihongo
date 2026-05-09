import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {DailyLearn} from '../entities/DailyLearn'
import {DailyLearnItem} from '../entities/DailyLearnItem'
import {ReviewQueue} from '../entities/ReviewQueue'
import {Streak} from '../entities/Streak'
import {User} from '../entities/User'
import {DailyLearnGenerationService} from '../services/daily-learn-generation.service'
import {StreakService} from '../services/streak.service'

// Helper function to get pending daily learn with safety check
async function getPendingDailyLearnWithCheck(em: any, userId: string): Promise<DailyLearn | null> {
  const dailyLearn = await em.findOne(DailyLearn, {
    user: userId,
    status: 'PENDING',
  }, {
    populate: ['items', 'items.word', 'items.grammar'],
    orderBy: {id: 'DESC'},
  })

  if (!dailyLearn) {
    return null
  }

  // Safety check: if all items are mastered but status is still PENDING, update it
  const allItems = dailyLearn.items.getItems()
  const allMastered = allItems.length > 0 && allItems.every((item: DailyLearnItem) => item.masteredAt !== null && item.masteredAt !== undefined)

  if (allMastered && dailyLearn.status === 'PENDING') {
    console.log('[getPendingDailyLearnWithCheck] All items mastered but status is PENDING. Updating to COMPLETED')
    dailyLearn.status = 'COMPLETED'
    dailyLearn.completedAt = new Date()
    await em.flush()

    // Try to get the next PENDING daily learn
    return getPendingDailyLearnWithCheck(em, userId)
  }

  return dailyLearn
}

interface LearnTodayResponse {
  id: number
  generatedDate: string
  status: string
  completedAt: string | null
  items: LearnItemResponse[]
  isExtraBatch?: boolean
}

interface LearnItemResponse {
  id: number
  type: 'word' | 'grammar'
  title: string
  subtitle?: string
  viewedAt: string | null
  masteredAt: string | null
  pushedToReviewAt: string | null
  wordId?: number
  grammarId?: number
}

interface ItemStatusResponse {
  canView: boolean
  viewedAt: string | null
}

interface StreakResponse {
  currentStreak: number
  longestStreak: number
  freezeAvailableAt: string | null
  lastCompletedDate: string | null
}

export const getTodayLearn = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

    // First try to get a PENDING daily learn
    let dailyLearn = await getPendingDailyLearnWithCheck(em, userId)

    // If no PENDING, check if there's a COMPLETED learn from today
    if (!dailyLearn) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      dailyLearn = await em.findOne(DailyLearn, {
        user: userId,
        generatedDate: { $gte: today, $lt: tomorrow },
      }, {
        populate: ['items', 'items.word', 'items.grammar'],
        orderBy: { id: 'DESC' }
      })
    }

    if (!dailyLearn) {
      return res.json({id: null, items: []})
    }

    const items: LearnItemResponse[] = []
    for (const item of dailyLearn.items.getItems()) {
      if (item.word) {
        items.push({
          id: item.id,
          type: 'word' as const,
          title: item.word.reading,
          subtitle: item.word.kanji || undefined,
          viewedAt: item.viewedAt?.toISOString() || null,
          masteredAt: item.masteredAt?.toISOString() || null,
          pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
          wordId: item.word.id,
        })
      } else if (item.grammar) {
        items.push({
          id: item.id,
          type: 'grammar' as const,
          title: item.grammar.grammarPoint,
          subtitle: item.grammar.meaning,
          viewedAt: item.viewedAt?.toISOString() || null,
          masteredAt: item.masteredAt?.toISOString() || null,
          pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
          grammarId: item.grammar.id,
        })
      }
    }

    const response: LearnTodayResponse = {
      id: dailyLearn.id,
      generatedDate: dailyLearn.generatedDate.toISOString(),
      status: dailyLearn.status,
      completedAt: dailyLearn.completedAt?.toISOString() || null,
      items,
      isExtraBatch: dailyLearn.isExtraBatch || false,
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching today learn:', error)
    res.status(500).json({error: 'Failed to fetch today learn'})
  }
}

export const markItemAsViewed = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const itemId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)

    if (isNaN(itemId)) {
      return res.status(400).json({error: 'Invalid item ID'})
    }

    const dailyLearnItem = await em.findOne(DailyLearnItem, itemId, {
      populate: ['dailyLearn.user'],
    })

    if (!dailyLearnItem) {
      return res.status(404).json({error: 'Item not found'})
    }

    if (dailyLearnItem.dailyLearn.user.id !== userId) {
      return res.status(403).json({error: 'Access denied'})
    }

    if (dailyLearnItem.viewedAt) {
      return res.json({viewedAt: dailyLearnItem.viewedAt.toISOString()})
    }

    dailyLearnItem.viewedAt = new Date()
    await em.flush()

    res.json({viewedAt: dailyLearnItem.viewedAt.toISOString()})
  } catch (error) {
    console.error('Error marking item as viewed:', error)
    res.status(500).json({error: 'Failed to mark item as viewed'})
  }
}

export const checkItemStatus = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const itemId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id)

    if (isNaN(itemId)) {
      return res.status(400).json({error: 'Invalid item ID'})
    }

    const dailyLearnItem = await em.findOne(DailyLearnItem, itemId, {
      populate: ['dailyLearn.user'],
    })

    if (!dailyLearnItem) {
      return res.status(404).json({error: 'Item not found'})
    }

    if (dailyLearnItem.dailyLearn.user.id !== userId) {
      return res.status(403).json({error: 'Access denied'})
    }

    const response: ItemStatusResponse = {
      canView: dailyLearnItem.viewedAt !== undefined,
      viewedAt: dailyLearnItem.viewedAt?.toISOString() || null,
    }

    res.json(response)
  } catch (error) {
    console.error('Error checking item status:', error)
    res.status(500).json({error: 'Failed to check item status'})
  }
}

export const pushToReview = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

    const dailyLearn = await em.findOne(DailyLearn, {
      user: userId,
      status: 'PENDING',
    }, {
      populate: ['items', 'items.word', 'items.grammar'],
    })

    if (!dailyLearn) {
      return res.status(404).json({error: 'No pending daily learn found'})
    }

    const viewedItems = dailyLearn.items.getItems().filter(
      (item: DailyLearnItem) => item.viewedAt && !item.pushedToReviewAt
    )

    if (viewedItems.length === 0) {
      return res.json({pushed: 0, message: 'No new viewed items to push'})
    }

    const reviewItems = viewedItems
      .filter((item: DailyLearnItem) => item.word || item.grammar)
      .map((item: DailyLearnItem) =>
        em.create(ReviewQueue, {
          user: userId,
          word: item.word || undefined,
          grammar: item.grammar || undefined,
          createdAt: new Date(),
        })
      )

    await em.persistAndFlush(reviewItems)

    viewedItems.forEach((item: DailyLearnItem) => {
      item.pushedToReviewAt = new Date()
    })
    await em.flush()

    res.json({pushed: reviewItems.length})
  } catch (error) {
    console.error('Error pushing to review:', error)
    res.status(500).json({error: 'Failed to push to review'})
  }
}

export const getStreak = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

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

    const response: StreakResponse = {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      freezeAvailableAt: streak.freezeAvailableAt?.toISOString() || null,
      lastCompletedDate: streak.lastCompletedDate?.toISOString() || null,
    }

    res.json(response)
  } catch (error) {
    console.error('Error fetching streak:', error)
    res.status(500).json({error: 'Failed to fetch streak'})
  }
}

export const mirrorMasteredToDailyLearnItem = async (
  dailyLearnItemId: number
): Promise<void> => {
  const em = DI.em
  const item = await em.findOne(DailyLearnItem, dailyLearnItemId, {
    populate: ['dailyLearn'],
  })

  if (!item) {
    return
  }

  if (item.masteredAt) {
    return
  }

  item.masteredAt = new Date()
  await em.flush()

  const dailyLearn = item.dailyLearn
  const allItems = await em.find(DailyLearnItem, {dailyLearn: dailyLearn.id})

  const allMastered = allItems.every((i: DailyLearnItem) => i.masteredAt !== undefined)

  if (allMastered && dailyLearn.status === 'PENDING') {
    dailyLearn.status = 'COMPLETED'
    dailyLearn.completedAt = new Date()
    await em.flush()

    const streakService = new StreakService(em)
    await streakService.updateStreakOnDailyLearnCompletion(dailyLearn.id)
  }
}

export const generateDailyLearn = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

    console.log('[generateDailyLearn] Starting generation for user:', userId)

    // First check if there's already a daily learn for today (COMPLETED or PENDING)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingToday = await em.findOne(DailyLearn, {
      user: userId,
      generatedDate: { $gte: today, $lt: tomorrow },
    }, {
      populate: ['items', 'items.word', 'items.grammar'],
      orderBy: { id: 'DESC' }
    })

    if (existingToday) {
      console.log('[generateDailyLearn] Found existing daily learn for today:', existingToday.id, 'status:', existingToday.status)

      if (existingToday.status === 'PENDING') {
        // Return the pending learn
        const items: LearnItemResponse[] = []
        for (const item of existingToday.items.getItems()) {
          if (item.word) {
            items.push({
              id: item.id,
              type: 'word' as const,
              title: item.word.reading,
              subtitle: item.word.kanji || undefined,
              viewedAt: item.viewedAt?.toISOString() || null,
              masteredAt: item.masteredAt?.toISOString() || null,
              pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
              wordId: item.word.id,
            })
          } else if (item.grammar) {
            items.push({
              id: item.id,
              type: 'grammar' as const,
              title: item.grammar.grammarPoint,
              subtitle: item.grammar.meaning,
              viewedAt: item.viewedAt?.toISOString() || null,
              masteredAt: item.masteredAt?.toISOString() || null,
              pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
              grammarId: item.grammar.id,
            })
          }
        }

        return res.json({
          id: existingToday.id,
          generatedDate: existingToday.generatedDate.toISOString(),
          status: existingToday.status,
          items,
        })
      } else {
        // Today's learning is already completed
        return res.json({
          id: null,
          generatedDate: null,
          status: null,
          items: [],
          message: 'You have already completed today\'s learning! Come back tomorrow for new content, or generate an extra batch for more practice.',
        })
      }
    }

    const generationService = new DailyLearnGenerationService(em)
    const dailyLearn = await generationService.generateForUser(userId)

    console.log('[generateDailyLearn] Generation result:', dailyLearn ? `ID: ${dailyLearn.id}, Items: ${dailyLearn.items.length}` : 'null')

    if (!dailyLearn) {
      return res.json({
        id: null,
        generatedDate: null,
        status: null,
        items: [],
        message: 'No daily learn generated. You may need to complete onboarding or finish pending items first.',
      })
    }

    const items: LearnItemResponse[] = []
    for (const item of dailyLearn.items.getItems()) {
      if (item.word) {
        items.push({
          id: item.id,
          type: 'word' as const,
          title: item.word.reading,
          subtitle: item.word.kanji || undefined,
          viewedAt: item.viewedAt?.toISOString() || null,
          masteredAt: item.masteredAt?.toISOString() || null,
          pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
          wordId: item.word.id,
        })
      } else if (item.grammar) {
        items.push({
          id: item.id,
          type: 'grammar' as const,
          title: item.grammar.grammarPoint,
          subtitle: item.grammar.meaning,
          viewedAt: item.viewedAt?.toISOString() || null,
          masteredAt: item.masteredAt?.toISOString() || null,
          pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
          grammarId: item.grammar.id,
        })
      }
    }

    const response: GenerateDailyLearnResponse = {
      id: dailyLearn.id,
      generatedDate: dailyLearn.generatedDate.toISOString(),
      status: dailyLearn.status,
      items,
    }

    res.json(response)
  } catch (error) {
    console.error('Error generating daily learn:', error)
    res.status(500).json({error: 'Failed to generate daily learn'})
  }
}

interface GenerateDailyLearnResponse {
  id: number
  generatedDate: string
  status: string
  items: LearnItemResponse[]
  message?: string
  isExtraBatch?: boolean
}

export const generateForUser = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const targetUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId

    const user = await em.findOne(User, {id: targetUserId})
    if (!user) {
      return res.status(404).json({error: 'User not found'})
    }

    const generationService = new DailyLearnGenerationService(em)
    const dailyLearn = await generationService.generateForUser(targetUserId)

    if (!dailyLearn) {
      return res.json({
        message: 'No daily learn generated (user may not have onboarding or has pending items)',
        dailyLearn: null,
      })
    }

    res.json({
      message: 'Daily learn generated successfully',
      dailyLearn: {
        id: dailyLearn.id,
        generatedDate: dailyLearn.generatedDate,
        status: dailyLearn.status,
      },
    })
  } catch (error) {
    console.error('Error generating daily learn:', error)
    res.status(500).json({error: 'Failed to generate daily learn'})
  }
}

export const generateExtraBatch = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

    const generationService = new DailyLearnGenerationService(em)
    const dailyLearn = await generationService.generateExtraBatch(userId)

    if (!dailyLearn) {
      console.log('[generateExtraBatch] No dailyLearn generated for user:', userId)
      return res.json({
        id: null,
        generatedDate: null,
        status: null,
        items: [],
        message: 'Congratulations! You\'ve mastered all available items at your current level. Consider updating your onboarding level to access more content!',
        isExtraBatch: false,
      })
    }

    console.log('[generateExtraBatch] Generated dailyLearn:', dailyLearn.id, 'items:', dailyLearn.items.length)

    const items: LearnItemResponse[] = []
    for (const item of dailyLearn.items.getItems()) {
      if (item.word) {
        items.push({
          id: item.id,
          type: 'word' as const,
          title: item.word.reading,
          subtitle: item.word.kanji || undefined,
          viewedAt: item.viewedAt?.toISOString() || null,
          masteredAt: item.masteredAt?.toISOString() || null,
          pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
          wordId: item.word.id,
        })
      } else if (item.grammar) {
        items.push({
          id: item.id,
          type: 'grammar' as const,
          title: item.grammar.grammarPoint,
          subtitle: item.grammar.meaning,
          viewedAt: item.viewedAt?.toISOString() || null,
          masteredAt: item.masteredAt?.toISOString() || null,
          pushedToReviewAt: item.pushedToReviewAt?.toISOString() || null,
          grammarId: item.grammar.id,
        })
      }
    }

    const response: GenerateDailyLearnResponse = {
      id: dailyLearn.id,
      generatedDate: dailyLearn.generatedDate.toISOString(),
      status: dailyLearn.status,
      items,
      isExtraBatch: true,
    }

    res.json(response)
  } catch (error) {
    console.error('Error generating extra batch:', error)
    res.status(500).json({error: 'Failed to generate extra batch'})
  }
}

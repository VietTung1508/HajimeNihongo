import { Request, Response } from 'express'
import { DI } from '../utils/di'
import { User } from '../entities/User'
import { UserOnboarding } from '../entities/UserOnboading'
import { Streak } from '../entities/Streak'
import { UserWordProgress } from '../entities/UserWordProgress'
import { UserGrammarProgress } from '../entities/UserGrammarProgress'
import { ReviewHistory } from '../entities/ReviewHistory'
import { DailyLearn } from '../entities/DailyLearn'
import { DailyLearnStatus } from '../enums/learn.enum'
import { Role } from '../entities/Role'

export async function listAccounts(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const offset = (page - 1) * limit
    const { search, level, studyPace } = req.query as Record<string, string>

    // Client-user accounts = users with NO roles assigned
    const db = DI.em.getKnex()
    const adminIdsResult = await db.select('user_id').from('user_roles').distinct()
    const adminIds: string[] = adminIdsResult.map((r: { user_id: string }) => r.user_id)

    const filter: Record<string, unknown> = {}
    if (adminIds.length > 0) filter.id = { $nin: adminIds }

    if (search) {
      const s = `%${search}%`
      filter.$or = [
        { email: { $ilike: s } },
        { username: { $ilike: s } },
      ]
    }

    if (level || studyPace) {
      const onboardingFilter: Record<string, unknown> = {}
      if (level) onboardingFilter.level = level
      if (studyPace) onboardingFilter.studyPace = studyPace
      filter.onboarding = onboardingFilter
    }

    const [users, total] = await DI.em.findAndCount(
      User,
      filter as any,
      {
        populate: ['onboarding'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    )

    return res.status(200).json({
      data: users.map((u: User) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        avatarUrl: u.avatarUrl ?? null,
        gender: u.gender ?? null,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt ?? null,
        onboarding: u.onboarding
          ? { level: u.onboarding.level, studyPace: u.onboarding.studyPace }
          : null,
      })),
      total,
      page,
      limit,
    })
  } catch (e) {
    console.error('listAccounts error:', e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function getAccount(req: Request, res: Response) {
  try {
    const id = req.params.id as string

    const db = DI.em.getKnex()
    const adminIdsResult = await db.select('user_id').from('user_roles').distinct()
    const adminIds: string[] = adminIdsResult.map((r: { user_id: string }) => r.user_id)

    if (adminIds.includes(id)) {
      return res.status(404).json({ message: 'Account not found' })
    }

    const user = await DI.em.findOne(
      User,
      { id },
      { populate: ['onboarding', 'roles'] },
    )
    if (!user) return res.status(404).json({ message: 'Account not found' })

    const [streak, wordsLearned, grammarLearned, totalReviews, correctReviews, dailyLearnSessions] =
      await Promise.all([
        DI.em.findOne(Streak, { user: { id } }),
        DI.em.count(UserWordProgress, { user: { id } }),
        DI.em.count(UserGrammarProgress, { user: { id } }),
        DI.em.count(ReviewHistory, { user: { id } }),
        DI.em.count(ReviewHistory, { user: { id }, isCorrect: true }),
        DI.em.count(DailyLearn, { user: { id }, status: DailyLearnStatus.COMPLETED }),
      ])

    const accuracyPercent = totalReviews > 0
      ? Math.round((correctReviews / totalReviews) * 100)
      : 0

    return res.status(200).json({
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone_number ?? null,
        avatarUrl: user.avatarUrl ?? null,
        gender: user.gender ?? null,
        dateOfBirth: user.dateOfBirth ?? null,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt ?? null,
        roles: user.roles.getItems().map((r: Role) => ({ id: r.id, name: r.name })),
      },
      onboarding: user.onboarding
        ? {
            level: user.onboarding.level,
            studyPace: user.onboarding.studyPace,
            studyPreference: user.onboarding.studyPreference,
            hasTakenPlacementTest: user.onboarding.hasTakenPlacementTest,
            placementTestCompletedAt: user.onboarding.placementTestCompletedAt ?? null,
          }
        : null,
      stats: {
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        wordsLearned,
        grammarLearned,
        totalReviews,
        correctReviews,
        accuracyPercent,
        dailyLearnSessions,
      },
    })
  } catch (e) {
    console.error('getAccount error:', e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

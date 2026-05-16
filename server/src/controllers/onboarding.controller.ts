import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {User} from '../entities/User'
import {onboardingSchema} from '../schemas/onboarding.schema'
import {UserOnboarding} from '../entities/UserOnboading'
import {PlacementTest} from '../entities/PlacementTest'

export async function createOnboarding(req: Request, res: Response) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({message: 'Unauthorized'})
    }

    const parsed = onboardingSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json(parsed.error)
    }

    const user = await DI.em.findOne(User, {id: userId})
    if (!user) {
      return res.status(404).json({message: 'User not found'})
    }

    const existing = await DI.em.findOne(UserOnboarding, {user})

    if (existing) {
      return res.status(400).json({message: 'Onboarding already completed'})
    }

    const onboarding = DI.em.create(UserOnboarding, {
      ...parsed.data,
      user,
    })

    await DI.em.persistAndFlush(onboarding)

    return res.json({
      message: 'Onboarding completed',
      onboardingCompleted: true,
      onboarding,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({message: 'Internal server error'})
  }
}

export async function getMyOnboarding(req: Request, res: Response) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({message: 'Unauthorized'})
    }

    const onboarding = await DI.em.findOne(
      UserOnboarding,
      {user: userId},
      {populate: ['user']},
    )

    if (!onboarding) {
      return res.json({onboardingCompleted: false})
    }

    return res.json({
      onboardingCompleted: true,
      onboarding,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({message: 'Internal server error'})
  }
}

export async function updateOnboarding(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({message: 'Unauthorized'})
    }

    const parsed = onboardingSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json(parsed.error)
    }

    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({message: 'At least one field is required'})
    }

    if (parsed.data.level === 'ZERO') {
      return res.status(400).json({message: 'ZERO is not a valid target level'})
    }

    const onboarding = await DI.em.findOne(UserOnboarding, {user: userId})
    if (!onboarding) {
      return res.status(404).json({message: 'Onboarding record not found'})
    }

    // Level change: reset placement test so dashboard shows PlacementQuiz
    if (parsed.data.level !== undefined && parsed.data.level !== onboarding.level) {
      onboarding.hasTakenPlacementTest = false
      onboarding.placementTestCompletedAt = null
      // Clear old attempt history for the target level so attempt counter resets to 1
      await DI.em.nativeDelete(PlacementTest, {user: userId, level: parsed.data.level})
    }

    if (parsed.data.level !== undefined) onboarding.level = parsed.data.level
    if (parsed.data.studyPace !== undefined) onboarding.studyPace = parsed.data.studyPace
    if (parsed.data.studyPreference !== undefined) onboarding.studyPreference = parsed.data.studyPreference

    await DI.em.flush()

    return res.json({
      level: onboarding.level,
      studyPace: onboarding.studyPace,
      studyPreference: onboarding.studyPreference,
      hasTakenPlacementTest: onboarding.hasTakenPlacementTest,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({message: 'Internal server error'})
  }
}

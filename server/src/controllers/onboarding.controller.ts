import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {User} from '../entities/User'
import {onboardingSchema} from '../schemas/onboarding.schema'
import {UserOnboarding} from '../entities/UserOnboading'

export async function createOnboarding(req: Request, res: Response) {
  try {
    console.log(req)

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

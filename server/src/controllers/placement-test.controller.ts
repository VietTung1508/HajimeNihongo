import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {PlacementTest, PlacementTestQuestion} from '../entities/PlacementTest'
import {LevelEnum} from '../enums/onboarding.enum'

// POST /placement-test/start
export const startQuiz = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {level} = req.body

    // Validate level
    if (!level || !Object.values(LevelEnum).includes(level)) {
      return res.status(400).json({error: 'Invalid level. Must be one of: N5, N4, N3, N2, N1'})
    }

    // Check if level is unlocked
    const placementTestService = DI.placementTestService
    if (!placementTestService) {
      return res.status(500).json({error: 'Placement test service not available'})
    }

    const isUnlocked = await placementTestService.isLevelUnlocked(userId, level)
    if (!isUnlocked) {
      return res.status(403).json({error: 'Level is not unlocked yet'})
    }

    // Get attempt count
    const existingTests = await em.find(PlacementTest, {
      user: userId,
      level: level
    })

    const attemptNumber = existingTests.length + 1

    // Generate quiz questions
    const questions = await placementTestService.generateQuiz(userId, level)

    res.json({
      attemptNumber,
      totalQuestions: questions.length,
      questions
    })
  } catch (error) {
    console.error('Error starting quiz:', error)
    res.status(500).json({error: 'Failed to start quiz'})
  }
}

// POST /placement-test/submit
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id
    const {level, answers, attemptNumber} = req.body

    // Validate level
    if (!level || !Object.values(LevelEnum).includes(level)) {
      return res.status(400).json({error: 'Invalid level. Must be one of: N5, N4, N3, N2, N1'})
    }

    // Validate answers
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({error: 'Invalid answers format'})
    }

    // Validate attempt number
    if (!attemptNumber || typeof attemptNumber !== 'number' || attemptNumber < 1) {
      return res.status(400).json({error: 'Invalid attempt number'})
    }

    const placementTestService = DI.placementTestService
    if (!placementTestService) {
      return res.status(500).json({error: 'Placement test service not available'})
    }

    // Submit quiz and get results
    const result = await placementTestService.submitQuiz(userId, level, answers, attemptNumber)

    res.json(result)
  } catch (error) {
    console.error('Error submitting quiz:', error)
    res.status(500).json({error: 'Failed to submit quiz'})
  }
}

// GET /placement-test/history
export const getQuizHistory = async (req: Request, res: Response) => {
  try {
    const em = DI.em
    const userId = req.user!.id

    const tests = await em.find(PlacementTest, {
      user: userId
    }, {
      orderBy: {createdAt: 'DESC'}
    })

    const history = tests.map((test: PlacementTest) => ({
      id: test.id,
      level: test.level,
      score: test.score,
      attemptNumber: test.attemptNumber,
      status: test.status,
      totalQuestions: test.questions.length,
      correctAnswers: test.questions.filter((q: PlacementTestQuestion) => q.isCorrect).length,
      createdAt: test.createdAt.toISOString()
    }))

    res.json({history})
  } catch (error) {
    console.error('Error fetching quiz history:', error)
    res.status(500).json({error: 'Failed to fetch quiz history'})
  }
}

// GET /placement-test/check?level=X
export const checkLevelUnlocked = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const {level} = req.query

    // Validate level
    if (!level || typeof level !== 'string' || !Object.values(LevelEnum).includes(level as LevelEnum)) {
      return res.status(400).json({error: 'Invalid level. Must be one of: N5, N4, N3, N2, N1'})
    }

    const placementTestService = DI.placementTestService
    if (!placementTestService) {
      return res.status(500).json({error: 'Placement test service not available'})
    }

    const isUnlocked = await placementTestService.isLevelUnlocked(userId, level as LevelEnum)

    res.json({
      level,
      unlocked: isUnlocked
    })
  } catch (error) {
    console.error('Error checking level unlocked:', error)
    res.status(500).json({error: 'Failed to check level status'})
  }
}

// GET /placement-test/unlocked
export const getUnlockedLevels = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    const placementTestService = DI.placementTestService
    if (!placementTestService) {
      return res.status(500).json({error: 'Placement test service not available'})
    }

    const unlockedLevels = await placementTestService.getUnlockedLevels(userId)

    res.json({
      levels: unlockedLevels
    })
  } catch (error) {
    console.error('Error fetching unlocked levels:', error)
    res.status(500).json({error: 'Failed to fetch unlocked levels'})
  }
}

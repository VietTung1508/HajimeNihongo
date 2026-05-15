import {Router} from 'express'
import {
  startQuiz,
  submitQuiz,
  getQuizHistory,
  checkLevelUnlocked,
  getUnlockedLevels
} from '../controllers/placement-test.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

router.use(auth)

router.post('/start', startQuiz)
router.post('/submit', submitQuiz)
router.get('/history', getQuizHistory)
router.get('/unlocked', getUnlockedLevels)
router.get('/check', checkLevelUnlocked)

export default router

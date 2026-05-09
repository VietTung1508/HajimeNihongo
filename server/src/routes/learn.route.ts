import {Router} from 'express'
import {
  getTodayLearn,
  markItemAsViewed,
  checkItemStatus,
  pushToReview,
  getStreak,
  generateDailyLearn,
  generateForUser,
  generateExtraBatch,
} from '../controllers/learn.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

router.use(auth)

router.get('/today', getTodayLearn)
router.post('/items/:id/view', markItemAsViewed)
router.get('/items/:id/status', checkItemStatus)
router.post('/push-to-review', pushToReview)
router.get('/streak', getStreak)
router.post('/generate', generateDailyLearn)
router.post('/generate-extra', generateExtraBatch)
router.post('/admin/generate/:userId', generateForUser)

export default router

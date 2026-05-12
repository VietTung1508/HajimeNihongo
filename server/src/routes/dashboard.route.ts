import {Router} from 'express'
import {
  getActivity,
  getWeakAreas,
  getStats,
} from '../controllers/dashboard.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

router.use(auth)

router.get('/activity', getActivity)
router.get('/weak-areas', getWeakAreas)
router.get('/stats', getStats)

export default router

import {Router} from 'express'
import {
  listSessions,
  createSession,
  deleteSession,
  toggleSessionFavorite,
  listMessages,
  sendMessage,
  getChatStats,
} from '../controllers/chat.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()
router.use(auth)

router.get('/stats', getChatStats)
router.get('/sessions', listSessions)
router.post('/sessions', createSession)
router.patch('/sessions/:id/favorite', toggleSessionFavorite)
router.delete('/sessions/:id', deleteSession)
router.get('/sessions/:id/messages', listMessages)
router.post('/sessions/:id/messages', sendMessage)

export default router

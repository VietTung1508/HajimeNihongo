import {Router} from 'express'
import {
  getReviewItems,
  addWordToQueue,
  removeWordFromQueue,
  addGrammarToQueue,
  removeGrammarFromQueue,
  getQueuedIds,
  markWordAsMastered,
  markGrammarAsMastered,
  getMasteredIds,
  unmarkWordAsMastered,
  unmarkGrammarAsMastered,
} from '../controllers/review-queue.controller'
import {recordReviewAttempt} from '../controllers/dashboard.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

router.use(auth)

// Review queue items (all types)
router.get('/items', getReviewItems)

// Word review queue
router.post('/word', addWordToQueue)
router.delete('/word', removeWordFromQueue)
router.post('/word/mastered', markWordAsMastered)
router.delete('/word/mastered', unmarkWordAsMastered)

// Grammar review queue
router.post('/grammar', addGrammarToQueue)
router.delete('/grammar', removeGrammarFromQueue)
router.post('/grammar/mastered', markGrammarAsMastered)
router.delete('/grammar/mastered', unmarkGrammarAsMastered)

// Get queued IDs by type
router.get('/ids', getQueuedIds)

// Get mastered IDs by type
router.get('/mastered', getMasteredIds)

// Record review attempt
router.post('/attempts', recordReviewAttempt)

export default router

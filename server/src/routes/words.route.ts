import {Router} from 'express'
import {getWordList, getWordDetail} from '../controllers/words.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

router.use(auth)

router.get('/', getWordList)

// NOTE: Keep specific routes before parameterized routes
// e.g., router.get('/search', searchWords) must come before router.get('/:id', getWordDetail)
router.get('/:id', getWordDetail)

export default router
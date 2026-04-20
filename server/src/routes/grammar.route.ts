import {Router} from 'express'
import {getGrammarList, searchGrammar, getGrammarDetail} from '../controllers/grammar.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

// All grammar routes require authentication
router.use(auth)

router.get('/', getGrammarList)
router.get('/search', searchGrammar)
router.get('/:id', getGrammarDetail)

export default router

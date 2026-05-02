import {Router} from 'express'
import {
  getWordBookmarks,
  getGrammarBookmarks,
  getBookmarkedIds,
  addWordBookmarks,
  removeWordBookmarks,
  addGrammarBookmarks,
  removeGrammarBookmarks,
} from '../controllers/bookmarks.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

router.use(auth)

// Word bookmarks (singular 'word' to match frontend type)
router.get('/word', getWordBookmarks)
router.post('/word', addWordBookmarks)
router.delete('/word', removeWordBookmarks)

// Grammar bookmarks
router.get('/grammar', getGrammarBookmarks)
router.post('/grammar', addGrammarBookmarks)
router.delete('/grammar', removeGrammarBookmarks)

router.get('/ids', getBookmarkedIds)

export default router

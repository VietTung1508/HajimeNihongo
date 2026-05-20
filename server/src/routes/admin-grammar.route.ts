import { Router } from 'express'
import { auth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/role.middleware'
import {
  listGrammar,
  getGrammarDetail,
  createGrammar,
  updateGrammar,
  deleteGrammar,
  addGrammarExample,
  updateGrammarExample,
  deleteGrammarExample,
} from '../controllers/admin-grammar.controller'

const router = Router()

router.get('/', auth, requirePermission('grammar:view'), listGrammar)
router.get('/:id', auth, requirePermission('grammar:view'), getGrammarDetail)
router.post('/', auth, requirePermission('grammar:create'), createGrammar)
router.patch('/:id', auth, requirePermission('grammar:edit'), updateGrammar)
router.delete('/:id', auth, requirePermission('grammar:delete'), deleteGrammar)

router.post('/:id/examples', auth, requirePermission('grammar:edit'), addGrammarExample)
router.patch('/:id/examples/:eid', auth, requirePermission('grammar:edit'), updateGrammarExample)
router.delete('/:id/examples/:eid', auth, requirePermission('grammar:edit'), deleteGrammarExample)

export default router

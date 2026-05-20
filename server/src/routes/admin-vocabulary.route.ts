import { Router } from 'express'
import { auth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/role.middleware'
import {
  createVocabulary,
  listVocabulary,
  getVocabularyDetail,
  updateVocabulary,
  deleteVocabulary,
  addMeaning,
  updateMeaning,
  deleteMeaning,
  addExample,
  updateExample,
  deleteExample,
} from '../controllers/admin-vocabulary.controller'

const router = Router()

router.get('/', auth, requirePermission('vocabulary:view'), listVocabulary)
router.post('/', auth, requirePermission('vocabulary:create'), createVocabulary)
router.get('/:id', auth, requirePermission('vocabulary:view'), getVocabularyDetail)
router.patch('/:id', auth, requirePermission('vocabulary:edit'), updateVocabulary)
router.delete('/:id', auth, requirePermission('vocabulary:delete'), deleteVocabulary)

router.post('/:id/meanings', auth, requirePermission('vocabulary:edit'), addMeaning)
router.patch('/:id/meanings/:mid', auth, requirePermission('vocabulary:edit'), updateMeaning)
router.delete('/:id/meanings/:mid', auth, requirePermission('vocabulary:edit'), deleteMeaning)

router.post('/:id/examples', auth, requirePermission('vocabulary:edit'), addExample)
router.patch('/:id/examples/:eid', auth, requirePermission('vocabulary:edit'), updateExample)
router.delete('/:id/examples/:eid', auth, requirePermission('vocabulary:edit'), deleteExample)

export default router

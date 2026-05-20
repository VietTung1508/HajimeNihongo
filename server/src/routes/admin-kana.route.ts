import { Router } from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/role.middleware'
import {
  listKana,
  getKanaById,
  createKana,
  updateKana,
  deleteKana,
  reorderKana,
  uploadKanaImage,
} from '../controllers/admin-kana.controller'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    cb(null, allowed.includes(file.mimetype))
  },
})

router.get('/', auth, requirePermission('kana:view'), listKana)
router.get('/:id', auth, requirePermission('kana:view'), getKanaById)
router.post('/', auth, requirePermission('kana:create'), createKana)
// IMPORTANT: static paths must be registered BEFORE /:id to avoid param collision
router.post('/upload', auth, requirePermission('kana:edit'), upload.single('image'), uploadKanaImage)
router.patch('/reorder', auth, requirePermission('kana:edit'), reorderKana)
router.patch('/:id', auth, requirePermission('kana:edit'), updateKana)
router.delete('/:id', auth, requirePermission('kana:delete'), deleteKana)

export default router

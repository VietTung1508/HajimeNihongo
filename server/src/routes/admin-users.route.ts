import { Router } from 'express'
import { listAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../controllers/admin-users.controller'
import { auth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/role.middleware'

const router = Router()

router.get('/', auth, requirePermission('user:view'), listAdminUsers)
router.post('/', auth, requirePermission('user:create'), createAdminUser)
router.patch('/:id', auth, requirePermission('user:edit'), updateAdminUser)
router.delete('/:id', auth, requirePermission('user:delete'), deleteAdminUser)

export default router

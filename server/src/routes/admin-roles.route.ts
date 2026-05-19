import { Router } from 'express'
import { listRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/admin-roles.controller'
import { auth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/role.middleware'

const router = Router()

router.get('/', auth, requirePermission('role:view'), listRoles)
router.get('/:id', auth, requirePermission('role:view'), getRole)
router.post('/', auth, requirePermission('role:create'), createRole)
router.patch('/:id', auth, requirePermission('role:edit'), updateRole)
router.delete('/:id', auth, requirePermission('role:delete'), deleteRole)

export default router

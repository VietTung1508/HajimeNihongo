import { Router } from 'express'
import { listAccounts, getAccount } from '../controllers/admin-accounts.controller'
import { auth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/role.middleware'

const router = Router()

router.get('/', auth, requirePermission('account:view'), listAccounts)
router.get('/:id', auth, requirePermission('account:view'), getAccount)

export default router

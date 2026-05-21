// server/src/routes/admin-dashboard.route.ts
import { Router } from 'express'
import { getDashboard } from '../controllers/admin-dashboard.controller'
import { auth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/role.middleware'

const router = Router()

router.get('/', auth, requirePermission('account:view'), getDashboard)

export default router

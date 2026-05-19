import { Router } from 'express'
import { listPermissions } from '../controllers/admin-permissions.controller'
import { auth } from '../middleware/auth.middleware'

const router = Router()

router.get('/', auth, listPermissions)

export default router

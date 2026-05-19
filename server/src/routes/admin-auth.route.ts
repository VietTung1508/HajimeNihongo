import { Router } from 'express'
import { adminLogin, adminMe, adminChangePassword } from '../controllers/admin-auth.controller'
import { auth } from '../middleware/auth.middleware'

const router = Router()

router.post('/login', adminLogin)
router.get('/me', auth, adminMe)
router.post('/change-password', auth, adminChangePassword)

export default router

import {Router} from 'express'
import multer from 'multer'
import {auth} from '../middleware/auth.middleware'
import {requirePermission} from '../middleware/role.middleware'
import * as landing from '../controllers/landing.controller'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 5 * 1024 * 1024},
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    cb(null, allowed.includes(file.mimetype))
  },
})

// Public
router.get('/', landing.getLandingData)

// Admin only
router.use(auth)
router.use(requirePermission('landing:manage'))

router.put('/config/:sectionKey', landing.updateSectionConfig)
router.put('/positions', landing.updateSectionPositions)

// /positions MUST be before /:id to avoid Express matching "positions" as an id
router.put('/testimonials/positions', landing.updateTestimonialPositions)
router.post('/testimonials', landing.createTestimonial)
router.put('/testimonials/:id', landing.updateTestimonial)
router.delete('/testimonials/:id', landing.deleteTestimonial)

router.post('/upload', upload.single('image'), landing.uploadImage)

export default router

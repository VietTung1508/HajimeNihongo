import {Router} from 'express'
import {getWordAudio, getExampleAudio} from '../controllers/audio.controller'

const router = Router()

// Audio routes are public - they redirect to Cloudinary URLs
router.get('/word/:id', getWordAudio)
router.get('/example/:id', getExampleAudio)

export default router

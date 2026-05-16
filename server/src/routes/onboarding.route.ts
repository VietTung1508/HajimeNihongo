import {Router} from 'express'
import {
  createOnboarding,
  getMyOnboarding,
  updateOnboarding,
} from '../controllers/onboarding.controller'
import {auth} from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: User onboarding APIs
 */

/**
 * @swagger
 * /onboarding:
 *   post:
 *     summary: Complete onboarding
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [ZERO, N5, N4, N3, N2, N1]
 *               studyPace:
 *                 type: string
 *                 enum: [RELAX, DETERMINED, RIGOROUS]
 *               studyPreference:
 *                 type: string
 *                 enum: [GRAMMAR, VOCABULARY, BOTH]
 *     responses:
 *       200:
 *         description: Onboarding completed
 *       400:
 *         description: Invalid input or onboarding already completed
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, createOnboarding)

/**
 * @swagger
 * /onboarding/me:
 *   get:
 *     summary: Get my onboarding status
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, getMyOnboarding)
/**
 * @swagger
 * /onboarding/me:
 *   patch:
 *     summary: Update onboarding preferences
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [N5, N4, N3, N2, N1]
 *               studyPace:
 *                 type: string
 *                 enum: [RELAX, DETERMINED, RIGOROUS]
 *               studyPreference:
 *                 type: string
 *                 enum: [GRAMMAR, VOCABULARY, BOTH]
 *     responses:
 *       200:
 *         description: Preferences updated
 *       400:
 *         description: Empty body, invalid input, or ZERO level provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Onboarding record not found
 */
router.patch('/me', auth, updateOnboarding)

export default router

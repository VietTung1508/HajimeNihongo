import {Router} from 'express'
import {getKanaSections} from '../controllers/kana.controller'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Kana
 *   description: Kana (Hiragana/Katakana) content APIs
 */

/**
 * @swagger
 * /kana:
 *   get:
 *     summary: Get all kana sections grouped by type
 *     tags: [Kana]
 *     responses:
 *       200:
 *         description: Hiragana and Katakana sections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hiragana:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KanaSection'
 *                 katakana:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KanaSection'
 * components:
 *   schemas:
 *     KanaSection:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [hiragana, katakana]
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         order:
 *           type: integer
 */
router.get('/', getKanaSections)

export default router

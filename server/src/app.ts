import express from 'express'
import cors from 'cors'
import {authRoutes, onboardingRoutes, kanaRoutes, grammarRoutes, wordsRoutes, audioRoutes} from './routes'
import {setupSwagger} from './config/swagger'
import 'dotenv/config'

export const app = express()

app.use(express.json())

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  }),
)

app.use('/auth', authRoutes)
app.use('/onboarding', onboardingRoutes)
app.use('/kana', kanaRoutes)
app.use('/grammar', grammarRoutes)
app.use('/words', wordsRoutes)
app.use('/audio', audioRoutes)

setupSwagger(app)

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import {
  adminAuthRoutes, adminPermissionsRoutes, adminRolesRoutes, adminUsersRoutes, adminAccountsRoutes,
  adminVocabularyRoutes, adminGrammarRoutes, adminKanaRoutes, adminDashboardRoutes,
  authRoutes, onboardingRoutes, kanaRoutes, grammarRoutes, wordsRoutes,
  audioRoutes, bookmarksRouter, reviewQueueRouter, learnRoutes,
  dashboardRoutes, placementTestRoutes, chatRoutes, landingRoutes,
} from './routes'
import {setupSwagger} from './config/swagger'

export const app = express()

app.use(express.json())

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4001'],
    credentials: true,
  }),
)

app.use('/auth', authRoutes)
app.use('/onboarding', onboardingRoutes)
app.use('/kana', kanaRoutes)
app.use('/grammar', grammarRoutes)
app.use('/words', wordsRoutes)
app.use('/bookmarks', bookmarksRouter)
app.use('/audio', audioRoutes)
app.use('/review-queue', reviewQueueRouter)
app.use('/learn', learnRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/placement-test', placementTestRoutes)
app.use('/chat', chatRoutes)
app.use('/landing', landingRoutes)
app.use('/admin/auth', adminAuthRoutes)
app.use('/admin/permissions', adminPermissionsRoutes)
app.use('/admin/roles', adminRolesRoutes)
app.use('/admin/users', adminUsersRoutes)
app.use('/admin/accounts', adminAccountsRoutes)
app.use('/admin/vocabulary', adminVocabularyRoutes)
app.use('/admin/grammar', adminGrammarRoutes)
app.use('/admin/kana', adminKanaRoutes)
app.use('/admin/dashboard', adminDashboardRoutes)

setupSwagger(app)

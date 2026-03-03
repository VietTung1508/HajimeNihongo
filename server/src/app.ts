import express from 'express'
import cors from 'cors'
import {authRoutes} from './routes'

export const app = express()

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  }),
)
app.use('/api/auth', authRoutes)
app.use(express.json())

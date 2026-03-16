import jwt from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express'

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.sendStatus(401)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch {
    res.sendStatus(403)
  }
}

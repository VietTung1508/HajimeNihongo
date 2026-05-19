import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { DI } from '../utils/di'
import { User } from '../entities/User'
import { Role } from '../entities/Role'
import { Permission } from '../entities/Permission'

export async function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.sendStatus(401)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }

    const user = await DI.em.findOne(
      User,
      { id: decoded.id },
      { populate: ['roles.permissions'] },
    )

    if (!user) return res.sendStatus(401)

    const permissions = [
      ...new Set(
        user.roles.getItems().flatMap((role: Role) =>
          role.permissions.getItems().map((p: Permission) => p.key),
        ),
      ),
    ]

    ;(req as any).user = { id: user.id, permissions }
    next()
  } catch {
    // Expired or invalid token → 401 so frontend can trigger re-login
    res.sendStatus(401)
  }
}

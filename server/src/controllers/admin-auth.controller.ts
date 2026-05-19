import { Request, Response } from 'express'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { User } from '../entities/User'
import { Role } from '../entities/Role'
import { Permission } from '../entities/Permission'
import { DI } from '../utils/di'

function mergePermissions(user: User): string[] {
  return [
    ...new Set(
      user.roles.getItems().flatMap((role: Role) =>
        role.permissions.getItems().map((p: Permission) => p.key),
      ),
    ),
  ]
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const user = await DI.em.findOne(
      User,
      { email },
      { populate: ['roles.permissions'] },
    )

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (user.roles.length === 0) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' })

    return res.status(200).json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        mustChangePassword: user.mustChangePassword,
        permissions: mergePermissions(user),
      },
    })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function adminMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const user = await DI.em.findOne(
      User,
      { id: userId },
      { populate: ['roles.permissions'] },
    )

    if (!user) return res.sendStatus(401)

    return res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.getItems().map((r: Role) => ({ id: r.id, name: r.name })),
      permissions: mergePermissions(user),
    })
  } catch (e) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function adminChangePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const { newPassword } = req.body as { newPassword: string }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await DI.em.findOne(User, { id: userId })
    if (!user) return res.sendStatus(401)

    user.password = await argon2.hash(newPassword)
    user.mustChangePassword = false
    await DI.em.flush()

    return res.sendStatus(200)
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

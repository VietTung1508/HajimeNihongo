import { Request, Response } from 'express'
import argon2 from 'argon2'
import { v4 as uuid } from 'uuid'
import { DI } from '../utils/di'
import { User } from '../entities/User'
import { Role } from '../entities/Role'
import { GenderEnum } from '../enums/auth.enum'

const SUPER_ADMIN_EMAIL = 'admin@hajimenihongo.com'

export async function listAdminUsers(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10))
    const offset = (page - 1) * limit

    const [users, total] = await DI.em.findAndCount(
      User,
      { roles: { id: { $exists: true } } },
      { populate: ['roles'], orderBy: { createdAt: 'ASC' }, limit, offset },
    )

    return res.status(200).json({
      data: users.map((u: User) => ({
        id: u.id, email: u.email, username: u.username,
        roles: u.roles.getItems().map((r: Role) => ({ id: r.id, name: r.name })),
        gender: u.gender, dateOfBirth: u.dateOfBirth,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function createAdminUser(req: Request, res: Response) {
  try {
    const { email, username, password, roleIds, gender, dateOfBirth } = req.body as {
      email: string; username: string; password: string; roleIds?: string[];
      gender?: string; dateOfBirth?: string;
    }

    const existing = await DI.em.findOne(User, { email })
    if (existing) return res.status(409).json({ message: 'Email already in use' })

    const safeRoleIds = roleIds ?? []
    const roles = safeRoleIds.length > 0 ? await DI.em.find(Role, { id: { $in: safeRoleIds } }) : []
    const hashed = await argon2.hash(password)

    const user = DI.em.create(User, {
      id: uuid(), email, username, password: hashed, phone_number: '',
      gender: gender as GenderEnum | undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      mustChangePassword: true,
      createdAt: new Date(),
    })
    user.roles.set(roles)
    await DI.em.persistAndFlush(user)

    return res.status(201).json({
      id: user.id, email: user.email, username: user.username,
      roles: roles.map((r: Role) => ({ id: r.id, name: r.name })),
      gender: user.gender, dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function updateAdminUser(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { username, roleIds, gender, dateOfBirth } = req.body as {
      username?: string; roleIds?: string[];
      gender?: string; dateOfBirth?: string;
    }
    const callerId = (req as any).user?.id

    if (id === callerId) return res.status(400).json({ message: 'Cannot modify your own account' })

    const user = await DI.em.findOne(User, { id }, { populate: ['roles'] })
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.email === SUPER_ADMIN_EMAIL && roleIds !== undefined) {
      const superAdminRole = await DI.em.findOne(Role, { isSystem: true })
      if (superAdminRole && !roleIds.includes(superAdminRole.id)) {
        return res.status(400).json({ message: 'Cannot remove the Super Admin role from the system account' })
      }
    }

    if (username !== undefined) user.username = username
    if (gender !== undefined) user.gender = gender as GenderEnum
    if (dateOfBirth !== undefined) user.dateOfBirth = new Date(dateOfBirth)

    if (roleIds !== undefined) {
      const roles = roleIds.length > 0 ? await DI.em.find(Role, { id: { $in: roleIds } }) : []
      user.roles.set(roles)
    }

    await DI.em.flush()

    return res.status(200).json({
      id: user.id, email: user.email, username: user.username,
      roles: user.roles.getItems().map((r: Role) => ({ id: r.id, name: r.name })),
      gender: user.gender, dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function deleteAdminUser(req: Request, res: Response) {
  try {
    const { id } = req.params
    const callerId = (req as any).user?.id

    if (id === callerId) return res.status(400).json({ message: 'Cannot delete your own account' })

    const user = await DI.em.findOne(User, { id })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.email === SUPER_ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot delete the system admin account' })

    await DI.em.removeAndFlush(user)
    return res.sendStatus(204)
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

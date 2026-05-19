import { Request, Response } from 'express'
import { DI } from '../utils/di'
import { Role } from '../entities/Role'
import { Permission } from '../entities/Permission'
import { User } from '../entities/User'

export async function listRoles(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10))
    const offset = (page - 1) * limit

    const [roles, total] = await DI.em.findAndCount(Role, {}, {
      populate: ['permissions'],
      orderBy: { createdAt: 'ASC' },
      limit,
      offset,
    })

    const userCounts = await Promise.all(roles.map((r: Role) => DI.em.count(User, { roles: r })))

    return res.status(200).json({
      data: roles.map((r: Role, i: number) => ({
        id: r.id,
        name: r.name,
        isSystem: r.isSystem,
        permissionCount: r.permissions.length,
        permissions: r.permissions.getItems().map((p: Permission) => ({ key: p.key })),
        userCount: userCounts[i],
        createdAt: r.createdAt,
      })),
      total,
      page,
      limit,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function getRole(req: Request, res: Response) {
  try {
    const { id } = req.params
    const role = await DI.em.findOne(Role, { id }, { populate: ['permissions'] })
    if (!role) return res.status(404).json({ message: 'Role not found' })

    return res.status(200).json({
      id: role.id,
      name: role.name,
      isSystem: role.isSystem,
      permissionCount: role.permissions.length,
      permissionIds: role.permissions.getItems().map((p: Permission) => p.id),
      createdAt: role.createdAt,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function createRole(req: Request, res: Response) {
  try {
    const { name, permissionIds } = req.body as { name: string; permissionIds: string[] }

    const existing = await DI.em.findOne(Role, { name })
    if (existing) return res.status(409).json({ message: 'Role name already exists' })

    const permissions = await DI.em.find(Permission, { id: { $in: permissionIds } })
    const role = DI.em.create(Role, { name, isSystem: false, createdAt: new Date() })
    role.permissions.set(permissions)
    await DI.em.persistAndFlush(role)

    return res.status(201).json({
      id: role.id, name: role.name, isSystem: role.isSystem,
      permissionCount: permissions.length, createdAt: role.createdAt,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { name, permissionIds } = req.body as { name?: string; permissionIds?: string[] }

    const role = await DI.em.findOne(Role, { id }, { populate: ['permissions'] })
    if (!role) return res.status(404).json({ message: 'Role not found' })
    if (role.isSystem) return res.status(403).json({ message: 'Cannot modify a system role' })

    if (name !== undefined) role.name = name
    if (permissionIds !== undefined) {
      const permissions = await DI.em.find(Permission, { id: { $in: permissionIds } })
      role.permissions.set(permissions)
    }

    await DI.em.flush()
    return res.status(200).json({
      id: role.id, name: role.name, isSystem: role.isSystem,
      permissionCount: role.permissions.length, createdAt: role.createdAt,
    })
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

export async function deleteRole(req: Request, res: Response) {
  try {
    const { id } = req.params
    const role = await DI.em.findOne(Role, { id }, { populate: ['permissions'] })
    if (!role) return res.status(404).json({ message: 'Role not found' })
    if (role.isSystem) return res.status(403).json({ message: 'Cannot delete a system role' })

    const userCount = await DI.em.count(User, { roles: role })
    if (userCount > 0) {
      return res.status(409).json({ message: `Role is assigned to ${userCount} user(s)`, userCount })
    }

    await DI.em.removeAndFlush(role)
    return res.sendStatus(204)
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

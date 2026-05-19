import { Request, Response } from 'express'
import { DI } from '../utils/di'
import { Permission } from '../entities/Permission'

export async function listPermissions(req: Request, res: Response) {
  try {
    const permissions = (await DI.em.findAll(Permission, { orderBy: { key: 'ASC' } })) as Permission[]

    const grouped: Record<string, { id: string; key: string; action: string }[]> = {}
    for (const perm of permissions) {
      const [module, action] = perm.key.split(':')
      if (!grouped[module]) grouped[module] = []
      grouped[module].push({ id: perm.id, key: perm.key, action })
    }

    const result = Object.entries(grouped).map(([module, actions]) => ({ module, actions }))
    return res.status(200).json(result)
  } catch {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

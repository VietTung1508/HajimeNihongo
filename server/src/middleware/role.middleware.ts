import { Request, Response, NextFunction } from 'express'

export function requirePermission(key: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions: string[] = (req as any).user?.permissions ?? []
    if (!permissions.includes(key)) {
      return res.sendStatus(403)
    }
    next()
  }
}

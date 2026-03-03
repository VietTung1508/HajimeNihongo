import {Request, Response} from 'express'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import {User, UserRole} from '../entities/User'
import {DI} from '../utils/di'

export async function register(req: Request, res: Response) {
  const {email, password} = req.body

  const hashed = await argon2.hash(password)

  const user = DI.em.create(User, {
    email,
    password: hashed,
    role: UserRole.USER,
  })

  await DI.em.persistAndFlush(user)
  res.json({message: 'Registered'})
}

export async function login(req: Request, res: Response) {
  const {email, password} = req.body

  const user = await DI.em.findOne(User, {email})
  if (!user || !(await argon2.verify(user.password, password))) {
    return res.status(401).json({message: 'Invalid credentials'})
  }

  const token = jwt.sign(
    {id: user.id, role: user.role},
    process.env.JWT_SECRET!,
    {expiresIn: '7d'},
  )

  res.json({token})
}

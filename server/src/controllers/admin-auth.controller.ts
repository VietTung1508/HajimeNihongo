import {Request, Response} from 'express'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import {User} from '../entities/User'
import {DI} from '../utils/di'
import {UserRole} from '../enums/auth.enum'

export async function adminLogin(req: Request, res: Response) {
  try {
    const {email, password} = req.body
    const user = await DI.em.findOne(User, {email})

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({message: 'Invalid credentials'})
    }

    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({message: 'Access denied'})
    }

    const token = jwt.sign(
      {id: user.id, role: user.role},
      process.env.JWT_SECRET!,
      {expiresIn: '1d'},
    )

    return res.status(200).json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (e) {
    return res.status(500).json({message: 'Something went wrong'})
  }
}

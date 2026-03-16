import {Request, Response} from 'express'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import {User} from '../entities/User'
import {DI} from '../utils/di'
import {UserRole} from '../enums/auth.enum'
import {UserOnboarding} from '../entities/UserOnboading'

function generateToken(user: User) {
  return jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })
}

function sanitizeUser(user: User) {
  return {
    email: user.email,
    username: user.username,
  }
}

export async function register(req: Request, res: Response) {
  try {
    const {email, password, username} = req.body

    const existingUser = await DI.em.findOne(User, {email})

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
      })
    }

    const hashed = await argon2.hash(password)

    const user = DI.em.create(User, {
      username,
      email,
      password: hashed,
      role: UserRole.USER,
    })

    await DI.em.persistAndFlush(user)

    const token = generateToken(user)
    return res.status(201).json({
      message: 'Registered successfully',
      accessToken: token,
      user: sanitizeUser(user),
    })
  } catch (e) {
    res.status(500).json({message: 'Something went wrong'})
  }
}

export async function login(req: Request, res: Response) {
  try {
    const {email, password} = req.body
    const user = await DI.em.findOne(User, {email})

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(401).json({message: 'Invalid credentials'})
    }

    const token = generateToken(user)

    const isAlreadyOnBoard = await DI.em.findOne(UserOnboarding, {user})

    return res.status(200).json({
      accessToken: token,
      user: sanitizeUser(user),
      onboardingCompleted: !!isAlreadyOnBoard,
    })
  } catch (e) {
    return res.status(500).json({message: 'Something went wrong'})
  }
}

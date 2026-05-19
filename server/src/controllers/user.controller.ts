import {Request, Response} from 'express'
import argon2 from 'argon2'
import {User} from '../entities/User'
import {DI} from '../utils/di'
import {uploadToCloudinary} from '../utils/uploadToCloudinary'
import {GenderEnum} from '../enums/auth.enum'

function sanitizeProfileUser(user: User) {
  return {
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    phoneNumber: user.phone_number ?? null,
    gender: user.gender ?? null,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
  }
}

export async function updateUsername(req: Request, res: Response) {
  try {
    const {username, phoneNumber, gender, dateOfBirth} = req.body
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({message: 'Username is required'})
    }
    if (gender !== undefined && gender !== null && !Object.values(GenderEnum).includes(gender)) {
      return res.status(400).json({message: 'Invalid gender value'})
    }
    const user = await DI.em.findOne(User, {id: req.user!.id})
    if (!user) return res.status(404).json({message: 'User not found'})
    user.username = username.trim()
    if (phoneNumber !== undefined) user.phone_number = phoneNumber || null
    if (gender !== undefined) user.gender = gender || undefined
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined
    await DI.em.flush()
    return res.json(sanitizeProfileUser(user))
  } catch {
    return res.status(500).json({message: 'Something went wrong'})
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    const {currentPassword, newPassword} = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({message: 'Both passwords are required'})
    }
    if (newPassword.length < 6) {
      return res.status(400).json({message: 'New password must be at least 6 characters'})
    }
    const user = await DI.em.findOne(User, {id: req.user!.id})
    if (!user) return res.status(404).json({message: 'User not found'})
    const valid = await argon2.verify(user.password, currentPassword)
    if (!valid) return res.status(401).json({message: 'Current password is incorrect'})
    user.password = await argon2.hash(newPassword)
    await DI.em.flush()
    return res.json({message: 'Password updated'})
  } catch {
    return res.status(500).json({message: 'Something went wrong'})
  }
}

export async function uploadAvatar(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({message: 'Invalid file'})
    const user = await DI.em.findOne(User, {id: req.user!.id})
    if (!user) return res.status(404).json({message: 'User not found'})
    let result: {secure_url: string}
    try {
      result = await uploadToCloudinary(req.file.buffer, {
        public_id: `avatar_${user.id}`,
        resource_type: 'image',
      })
    } catch(err) {
      console.log("go here")
      console.log(err)
      return res.status(500).json({message: 'Upload failed'})
    }
    user.avatarUrl = result.secure_url
    await DI.em.flush()
    return res.json({avatarUrl: user.avatarUrl})
  } catch {
    return res.status(500).json({message: 'Something went wrong'})
  }
}

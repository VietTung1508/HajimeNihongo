import 'dotenv/config'
import {MikroORM} from '@mikro-orm/postgresql'
import argon2 from 'argon2'
import {v4 as uuid} from 'uuid'
import config from '../mikro-orm.config'
import {User} from '../entities/User'
import {UserRole} from '../enums/auth.enum'

const ADMIN_EMAIL = 'admin@hajimenihongo.com'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'Admin@123'

async function seedAdmin() {
  const orm = await MikroORM.init(config)
  const em = orm.em.fork()

  try {
    const existing = await em.findOne(User, {email: ADMIN_EMAIL})
    if (existing) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`)
      await orm.close()
      return
    }

    const hashed = await argon2.hash(ADMIN_PASSWORD)
    const admin = em.create(User, {
      id: uuid(),
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      phone_number: '',
      password: hashed,
      role: UserRole.ADMIN,
      createdAt: new Date(),
    })

    await em.persistAndFlush(admin)
    console.log('Admin user created:')
    console.log(`  Email:    ${ADMIN_EMAIL}`)
    console.log(`  Password: ${ADMIN_PASSWORD}`)
    console.log(`  Role:     ${UserRole.ADMIN}`)
  } catch (err) {
    console.error('Failed to seed admin:', err)
    process.exit(1)
  } finally {
    await orm.close()
  }
}

seedAdmin()

import {MikroORM} from '@mikro-orm/postgresql'
import argon2 from 'argon2'
import {User, UserRole} from './entities/User'
import mikroOrmConfig from './mikro-orm.config'

async function seedAdmin() {
  const orm = await MikroORM.init(mikroOrmConfig)
  const em = orm.em.fork()

  const hashed = await argon2.hash('admin123')
  const admin = em.create(User, {
    email: 'admin@hajime.com',
    phone_number: '0123456789',
    password: hashed,
    role: UserRole.ADMIN,
    createdAt: new Date(),
  })

  await em.persistAndFlush(admin)
  console.log('✅ Admin created!')
  await orm.close(true)
}

seedAdmin()

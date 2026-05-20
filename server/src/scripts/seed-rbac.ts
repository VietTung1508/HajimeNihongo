import 'dotenv/config'
import { MikroORM } from '@mikro-orm/postgresql'
import config from '../mikro-orm.config'
import { Permission } from '../entities/Permission'
import { Role } from '../entities/Role'
import { User } from '../entities/User'

const MODULES = ['role', 'user', 'grammar', 'vocabulary', 'kana']
const ACTIONS = ['view', 'create', 'edit', 'delete']
const ADMIN_EMAIL = 'admin@hajimenihongo.com'

async function seedRbac() {
  const orm = await MikroORM.init(config)
  const em = orm.em.fork()

  try {
    // 1. Upsert all 20 permissions (idempotent)
    const allPermissionKeys = MODULES.flatMap(m => ACTIONS.map(a => `${m}:${a}`))
    const permissionEntities: Permission[] = []

    for (const key of allPermissionKeys) {
      let perm = await em.findOne(Permission, { key })
      if (!perm) {
        perm = em.create(Permission, { key })
        em.persist(perm)
      }
      permissionEntities.push(perm)
    }
    await em.flush()
    console.log(`Seeded ${permissionEntities.length} permissions`)

    // 1b. Upsert account:view permission (account module is read-only)
    const accountViewKey = 'account:view'
    let accountViewPerm = await em.findOne(Permission, { key: accountViewKey })
    if (!accountViewPerm) {
      accountViewPerm = em.create(Permission, { key: accountViewKey })
      em.persist(accountViewPerm)
    }
    permissionEntities.push(accountViewPerm)
    await em.flush()
    console.log(`Seeded account:view permission`)

    // 1c. Upsert write permissions for vocabulary and grammar
    const writePermKeys = ['vocabulary:write', 'grammar:write']
    for (const key of writePermKeys) {
      let perm = await em.findOne(Permission, { key })
      if (!perm) {
        perm = em.create(Permission, { key })
        em.persist(perm)
      }
      permissionEntities.push(perm)
    }
    await em.flush()
    console.log('Seeded vocabulary:write and grammar:write permissions')

    // 2. Upsert Super Admin role — ensure it exists first, then fetch populated
    const existing = await em.findOne(Role, { name: 'Super Admin' })
    if (!existing) {
      const newRole = em.create(Role, { name: 'Super Admin', isSystem: true, createdAt: new Date() })
      await em.persistAndFlush(newRole)
    }

    // Always fetch with permissions populated so LoadedCollection is available
    const superAdminRole = await em.findOneOrFail(Role, { name: 'Super Admin' }, { populate: ['permissions'] as const })

    const existingKeys = superAdminRole.permissions.getItems().map(p => p.key)
    for (const perm of permissionEntities) {
      if (!existingKeys.includes(perm.key)) {
        superAdminRole.permissions.add(perm)
      }
    }
    await em.flush()
    console.log('Super Admin role seeded with all permissions')

    // 3. Assign Super Admin role to seed admin user
    const adminUser = await em.findOne(User, { email: ADMIN_EMAIL }, { populate: ['roles'] as const })
    if (adminUser) {
      const hasRole = adminUser.roles.getItems().some(r => r.name === 'Super Admin')
      if (!hasRole) {
        adminUser.roles.add(superAdminRole)
        await em.flush()
        console.log('Super Admin role assigned to', ADMIN_EMAIL)
      } else {
        console.log('Admin user already has Super Admin role')
      }
    } else {
      console.log(`Warning: ${ADMIN_EMAIL} not found — run seed:admin first`)
    }
  } catch (err) {
    console.error('RBAC seed failed:', err)
    process.exit(1)
  } finally {
    await orm.close()
  }
}

seedRbac()

import {MikroORM} from '@mikro-orm/postgresql'
import config from '../mikro-orm.config'

export const DI = {
  orm: null as MikroORM | null,
  em: null as any,
}

export async function initDI() {
  const orm = await MikroORM.init(config)
  DI.orm = orm
  DI.em = orm.em.fork()
}

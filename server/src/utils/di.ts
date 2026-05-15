import {MikroORM} from '@mikro-orm/postgresql'
import config from '../mikro-orm.config'
import {PlacementTestService} from '../services/placement-test.service'
import {ChatService} from '../services/chat.service'

export const DI = {
  orm: null as MikroORM | null,
  em: null as any,
  placementTestService: null as PlacementTestService | null,
  chatService: null as ChatService | null,
}

export async function initDI() {
  const orm = await MikroORM.init(config)
  DI.orm = orm
  DI.em = orm.em.fork()
  DI.placementTestService = new PlacementTestService(DI.em)
  DI.chatService = new ChatService(orm)
}

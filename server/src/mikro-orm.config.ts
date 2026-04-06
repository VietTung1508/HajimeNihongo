import {defineConfig} from '@mikro-orm/postgresql'
import {PostgreSqlDriver} from '@mikro-orm/postgresql'
import {GrammarExample} from './entities/GrammarExample'

export default defineConfig({
  entities: ['dist/entities', GrammarExample],
  entitiesTs: ['src/entities'],
  dbName: 'hajimenihongo',
  user: 'admin',
  password: 'admin',
  host: '127.0.0.1',
  port: 5432,
  driver: PostgreSqlDriver,
  migrations: {
    path: './migrations',
    tableName: 'mikro_orm_migrations',
  },
})

import {defineConfig} from '@mikro-orm/postgresql'
import {PostgreSqlDriver} from '@mikro-orm/postgresql'
import {Grammar} from './entities/Grammar'
import {GrammarExample} from './entities/GrammarExample'
import {DailyLearn} from './entities/DailyLearn'
import {DailyLearnItem} from './entities/DailyLearnItem'
import {Streak} from './entities/Streak'

export default defineConfig({
  entities: ['dist/entities', Grammar, GrammarExample, DailyLearn, DailyLearnItem, Streak],
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

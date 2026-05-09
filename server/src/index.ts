import 'reflect-metadata'
import {app} from './app'
import {initDI} from './utils/di'
import {startDailyLearnCron} from './jobs/daily-learn-cron.job'

initDI().then(() => {
  startDailyLearnCron()
  app.listen(5000, () => console.log('Server running'))
})

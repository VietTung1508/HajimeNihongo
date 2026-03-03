import 'reflect-metadata'
import {app} from './app'
import {initDI} from './utils/di'

initDI().then(() => {
  app.listen(5000, () => console.log('Server running'))
})

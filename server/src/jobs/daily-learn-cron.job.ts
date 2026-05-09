import { schedule } from 'node-cron'
import { DI } from '../utils/di'
import { UserOnboarding } from '../entities/UserOnboading'
import { DailyLearnGenerationService } from '../services/daily-learn-generation.service'

export function startDailyLearnCron(): void {
  console.log('[DailyLearnCron] Starting cron job (runs at 00:00 UTC)')

  schedule('0 0 * * *', async () => {
    try {
      console.log(`[DailyLearnCron] Starting generation at ${new Date().toISOString()}`)

      const em = DI.em
      const generationService = new DailyLearnGenerationService(em)

      const onboardings = await em.find(UserOnboarding, {}, {
        fields: ['user'],
      })

      console.log(`[DailyLearnCron] Found ${onboardings.length} users with onboarding`)

      let generatedCount = 0
      let skippedCount = 0
      let errorCount = 0

      for (const onboarding of onboardings) {
        try {
          const userId = onboarding.user.id

          const dailyLearn = await generationService.generateForUser(userId)

          if (dailyLearn) {
            generatedCount++
            console.log(`[DailyLearnCron] Generated daily learn for user ${userId}`)
          } else {
            skippedCount++
            console.log(`[DailyLearnCron] Skipped user ${userId} (has pending or no pool)`)
          }
        } catch (error) {
          errorCount++
          console.error(`[DailyLearnCron] Error generating for user ${onboarding.user.id}:`, error)
        }
      }

      console.log(`[DailyLearnCron] Completed: ${generatedCount} generated, ${skippedCount} skipped, ${errorCount} errors`)
    } catch (error) {
      console.error('[DailyLearnCron] Fatal error:', error)
    }
  }, {
    timezone: 'UTC'
  })

  console.log('[DailyLearnCron] Cron job started successfully')
}

import {EntityManager} from '@mikro-orm/core'
import {Streak} from '../entities/Streak'
import {DailyLearn} from '../entities/DailyLearn'
import {DailyLearnStatus} from '../enums/learn.enum'

export class StreakService {
  constructor(private em: EntityManager) {}

  async reconcileStreakFromCompletedLearns(streak: Streak, userId: string): Promise<Streak> {
    if (streak.currentStreak > 0 && streak.lastCompletedDate) {
      return streak
    }

    const completedLearns = await this.em.find(DailyLearn, {
      user: userId,
      status: DailyLearnStatus.COMPLETED,
    })

    const completedDays = Array.from(new Set(
      completedLearns
        .map((dailyLearn: DailyLearn) => dailyLearn.completedAt || dailyLearn.generatedDate)
        .filter((date: Date | undefined): date is Date => date !== undefined)
        .map((date: Date) => this.getStartOfDay(date).getTime())
    )).sort((a, b) => b - a)

    if (completedDays.length === 0) {
      return streak
    }

    let currentStreak = 1
    for (let index = 1; index < completedDays.length; index++) {
      const gapDays = Math.floor((completedDays[index - 1] - completedDays[index]) / (1000 * 60 * 60 * 24))
      if (gapDays === 1) {
        currentStreak++
      } else if (gapDays > 1) {
        break
      }
    }

    streak.currentStreak = currentStreak
    streak.longestStreak = Math.max(streak.longestStreak, currentStreak)
    streak.lastCompletedDate = new Date(completedDays[0])
    await this.em.flush()

    return streak
  }

  async updateStreakOnDailyLearnCompletion(dailyLearnId: number): Promise<Streak | null> {
    const dailyLearn = await this.em.findOne(DailyLearn, dailyLearnId, {
      populate: ['user'],
    })

    if (!dailyLearn || dailyLearn.status !== DailyLearnStatus.COMPLETED) {
      return null
    }

    let streak = await this.em.findOne(Streak, {
      user: dailyLearn.user.id,
    })

    if (!streak) {
      streak = this.em.create(Streak, {
        user: dailyLearn.user,
        currentStreak: 0,
        longestStreak: 0,
        freezeAvailableAt: new Date(),
        freezesUsed: 0,
      })
      await this.em.persistAndFlush(streak)
    }

    const today = this.getStartOfDay(new Date())
    const lastCompleted = streak.lastCompletedDate
      ? this.getStartOfDay(streak.lastCompletedDate)
      : null

    if (lastCompleted && lastCompleted.getTime() === today.getTime()) {
      return streak
    }

    const gapDays = lastCompleted
      ? Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    if (!lastCompleted) {
      streak.currentStreak = 1
    } else if (gapDays === 0) {
      return streak
    } else if (gapDays === 1) {
      streak.currentStreak++
    } else if (gapDays > 1) {
      if (streak.freezeAvailableAt && streak.freezeAvailableAt <= today) {
        streak.currentStreak++
        streak.freezeAvailableAt = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        streak.freezesUsed++
      } else {
        streak.currentStreak = 1
      }
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak
    }

    streak.lastCompletedDate = dailyLearn.completedAt || today

    await this.em.flush()

    return streak
  }

  private getStartOfDay(date: Date): Date {
    const d = new Date(date)
    d.setUTCHours(0, 0, 0, 0)
    return d
  }
}

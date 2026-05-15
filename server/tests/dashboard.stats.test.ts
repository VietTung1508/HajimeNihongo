import 'reflect-metadata'
import type {} from '../src/types/express'
import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {getStats} from '../src/controllers/dashboard.controller'
import {DI} from '../src/utils/di'
import {LevelEnum} from '../src/enums/onboarding.enum'
import {MasteryTypeEnum} from '../src/enums/mastery.enum'
import {ReviewHistory} from '../src/entities/ReviewHistory'
import {Streak} from '../src/entities/Streak'
import {User} from '../src/entities/User'
import {UserWordProgress} from '../src/entities/UserWordProgress'
import {UserGrammarProgress} from '../src/entities/UserGrammarProgress'
import {UserLevelMastery} from '../src/entities/UserLevelMastery'

class StatsKnexQuery {
  private tableName = ''
  private distinctField = ''

  constructor(private readonly data: {
    wordCounts: Array<{jlpt_level: number; total: string}>
    grammarCounts: Array<{level: LevelEnum; total: string}>
    reviewDates: Array<{date: string}>
    learnDates: Array<{generated_date: string}>
  }) {}

  select() {
    return this
  }

  count() {
    return this
  }

  from(tableName: string) {
    this.tableName = tableName
    return this
  }

  where() {
    return this
  }

  whereNotNull() {
    return this
  }

  groupBy() {
    return this
  }

  distinct(field: string) {
    this.distinctField = field
    return this
  }

  then(resolve: (value: unknown[]) => void) {
    if (this.tableName === 'word') {
      return Promise.resolve(this.data.wordCounts).then(resolve)
    }

    if (this.tableName === 'grammar') {
      return Promise.resolve(this.data.grammarCounts).then(resolve)
    }

    if (this.tableName === 'review_history') {
      return Promise.resolve(this.data.reviewDates).then(resolve)
    }

    if (this.tableName === 'daily_learn' && this.distinctField === 'generated_date') {
      return Promise.resolve(this.data.learnDates).then(resolve)
    }

    return Promise.resolve([]).then(resolve)
  }
}

class StatsEntityManager {
  readonly data: {
    wordCounts: Array<{jlpt_level: number; total: string}>
    grammarCounts: Array<{level: LevelEnum; total: string}>
    reviewDates: Array<{date: string}>
    learnDates: Array<{generated_date: string}>
  } = {
    wordCounts: [{jlpt_level: 5, total: '5'}],
    grammarCounts: [{level: LevelEnum.N5, total: '8'}],
    reviewDates: [],
    learnDates: [],
  }

  async findOne(entity: unknown) {
    if (entity === Streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
      }
    }

    if (entity === User) {
      return {id: 'user-id'}
    }

    if (entity === ReviewHistory) {
      return null
    }

    return null
  }

  async find(entity: unknown, where?: Record<string, unknown>) {
    if (entity === UserWordProgress) {
      return [
        {word: {id: 1, jlptLevel: 5}},
        {word: {id: 2, jlptLevel: 5}},
      ]
    }

    if (entity === UserGrammarProgress) {
      return [
        {grammar: {id: 10, level: LevelEnum.N5}},
      ]
    }

    if (entity === UserLevelMastery) {
      return [
        {
          level: LevelEnum.N5,
          masteryType: MasteryTypeEnum.WAIVED,
        },
      ]
    }

    if (entity === ReviewHistory && where?.reviewedAt) {
      return []
    }

    return []
  }

  async count(entity: unknown) {
    if (entity === UserWordProgress) return 2
    if (entity === UserGrammarProgress) return 1
    return 0
  }

  create(_entity: unknown, data: unknown) {
    return data
  }

  async persistAndFlush() {}

  async flush() {}

  getKnex() {
    const query = new StatsKnexQuery(this.data)
    return Object.assign(query, {
      raw: (value: string) => value,
    })
  }
}

describe('Dashboard stats', () => {
  it('keeps actual mastered item count when a level is waived by placement', async () => {
    const originalEm = DI.em
    DI.em = new StatsEntityManager() as never

    const responseBody: Record<string, unknown> = {}
    const res = {
      json(body: Record<string, unknown>) {
        Object.assign(responseBody, body)
        return this
      },
      status() {
        return this
      },
    }

    try {
      await getStats({user: {id: 'user-id'}} as never, res as never)
    } finally {
      DI.em = originalEm
    }

    const jlptProgress = responseBody.jlptProgress as Record<string, {
      mastered: number
      total: number
      isMastered: boolean
      isWaived: boolean
    }>

    assert.equal(jlptProgress.N5.mastered, 3)
    assert.equal(jlptProgress.N5.total, 13)
    assert.equal(jlptProgress.N5.isMastered, true)
    assert.equal(jlptProgress.N5.isWaived, true)
  })

  it('counts multiple completed learn batches on the same calendar date as one studied day', async () => {
    const originalEm = DI.em
    const em = new StatsEntityManager()
    em.data.reviewDates = [{date: '2026-05-14'}]
    em.data.learnDates = [
      {generated_date: '2026-05-14T10:40:55.962Z'},
      {generated_date: '2026-05-14T15:04:17.396Z'},
    ]
    DI.em = em as never

    const responseBody: Record<string, unknown> = {}
    const res = {
      json(body: Record<string, unknown>) {
        Object.assign(responseBody, body)
        return this
      },
      status() {
        return this
      },
    }

    try {
      await getStats({user: {id: 'user-id'}} as never, res as never)
    } finally {
      DI.em = originalEm
    }

    assert.equal(responseBody.daysStudied, 1)
  })
})

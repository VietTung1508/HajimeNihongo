import 'reflect-metadata'
import assert from 'node:assert/strict'
import {beforeEach, describe, it} from 'node:test'
import {PlacementTestService} from '../src/services/placement-test.service'
import {LevelEnum} from '../src/enums/onboarding.enum'
import {Word} from '../src/entities/Word'
import {Grammar} from '../src/entities/Grammar'
import {UserWordProgress} from '../src/entities/UserWordProgress'
import {UserGrammarProgress} from '../src/entities/UserGrammarProgress'
import {UserOnboarding} from '../src/entities/UserOnboading'
import {UserLevelMastery} from '../src/entities/UserLevelMastery'
import {MasteryTypeEnum} from '../src/enums/mastery.enum'

const words = Array.from({length: 40}, (_, index) => ({
  id: index + 1,
  kanji: `語${index + 1}`,
  reading: `reading-${index + 1}`,
  jlptLevel: 3,
}))

const grammars = Array.from({length: 40}, (_, index) => ({
  id: index + 1,
  grammarPoint: `grammar-${index + 1}`,
  meaning: `meaning-${index + 1}`,
  level: LevelEnum.N3,
}))

class MockEntityManager {
  persisted: unknown[] = []
  onboarding = {
    level: LevelEnum.N3,
    hasTakenPlacementTest: false,
    placementTestCompletedAt: undefined as Date | undefined,
  }
  levelMasteries: Array<{
    user: string
    level: LevelEnum
    masteryType: MasteryTypeEnum
    earnedAt?: Date
    waivedAt?: Date
    createdAt: Date
  }> = []
  userWordProgress: Array<{user: string; word: {id: number; jlptLevel: number}}> = []
  userGrammarProgress: Array<{user: string; grammar: {id: number; level: LevelEnum}}> = []

  async find(entity: {name: string}, where?: any) {
    if (entity === Word) {
      const level = where?.jlptLevel
      const source = level === 5
        ? words.map((word) => ({...word, jlptLevel: 5}))
        : words
      return source.slice(0, 10)
    }
    if (entity === Grammar) {
      const level = where?.level
      const source = level === LevelEnum.N5
        ? grammars.map((grammar) => ({...grammar, level: LevelEnum.N5}))
        : grammars
      return source.slice(0, 10)
    }
    if (entity === UserWordProgress) return this.userWordProgress
    if (entity === UserGrammarProgress) return this.userGrammarProgress
    if (entity === UserLevelMastery) return this.levelMasteries
    return []
  }

  async findOne(entity: {name: string}, where?: any) {
    if (entity === UserOnboarding) return this.onboarding
    if (entity === UserLevelMastery) {
      return this.levelMasteries.find((mastery) => mastery.level === where.level) ?? null
    }
    return null
  }

  async count(entity: {name: string}) {
    if (entity === Word || entity === Grammar) return 10
    return 10
  }

  create(_entity: unknown, data: unknown) {
    return data
  }

  async persistAndFlush(entity: unknown) {
    if ((entity as {level?: LevelEnum; masteryType?: MasteryTypeEnum}).masteryType) {
      this.levelMasteries.push(entity as never)
    }
    this.persisted.push(entity)
  }

  async flush() {}
}

describe('PlacementTestService', () => {
  let em: MockEntityManager
  let service: PlacementTestService

  beforeEach(() => {
    em = new MockEntityManager()
    service = new PlacementTestService(em as never)
  })

  it('generates mixed vocabulary and grammar questions with answer options', async () => {
    const quiz = await service.generateQuiz('user-id', LevelEnum.N3)

    assert.equal(quiz.length, 20)
    assert.equal(quiz.filter((question) => question.type === 'word').length, 10)
    assert.equal(quiz.filter((question) => question.type === 'grammar').length, 10)
    assert.ok(quiz.every((question) => question.options.includes(question.correctAnswer)))
  })

  it('passes a quiz at 80 percent and marks placement complete', async () => {
    const quiz = await service.generateQuiz('user-id', LevelEnum.N3)
    const answers = Object.fromEntries(
      quiz.map((question, index) => [question.key, index < 16]),
    )

    const result = await service.submitQuiz('user-id', LevelEnum.N3, answers, 1)

    assert.equal(result.status, 'passed')
    assert.equal(result.passed, true)
    assert.equal(result.score, 80)
    assert.equal(em.onboarding.hasTakenPlacementTest, true)
    assert.ok(em.onboarding.placementTestCompletedAt)
  })

  it('forces the next lower level after the third failed attempt', async () => {
    const quiz = await service.generateQuiz('user-id', LevelEnum.N3)
    const answers = Object.fromEntries(
      quiz.map((question, index) => [question.key, index < 10]),
    )

    const result = await service.submitQuiz('user-id', LevelEnum.N3, answers, 3)

    assert.equal(result.status, 'forced')
    assert.equal(result.forcedToLevel, LevelEnum.N4)
    assert.equal(em.onboarding.level, LevelEnum.N4)
    assert.equal(em.onboarding.hasTakenPlacementTest, true)
  })

  it('unlocks the next level when grammar is fully mastered and vocabulary is at least 60 percent mastered', async () => {
    em.onboarding.level = LevelEnum.N5
    em.userGrammarProgress = Array.from({length: 10}, (_, index) => ({
      user: 'user-id',
      grammar: {id: index + 1, level: LevelEnum.N5},
    }))
    em.userWordProgress = Array.from({length: 6}, (_, index) => ({
      user: 'user-id',
      word: {id: index + 1, jlptLevel: 5},
    }))

    const unlockedLevels = await service.getUnlockedLevels('user-id')

    assert.deepEqual(unlockedLevels, [LevelEnum.N5, LevelEnum.N4])
    assert.equal(em.levelMasteries.length, 1)
    assert.equal(em.levelMasteries[0].level, LevelEnum.N5)
    assert.equal(em.levelMasteries[0].masteryType, MasteryTypeEnum.EARNED)
  })

  it('upgrades a waived level to earned when the user later meets mastery thresholds', async () => {
    em.onboarding.level = LevelEnum.N5
    em.levelMasteries = [{
      user: 'user-id',
      level: LevelEnum.N5,
      masteryType: MasteryTypeEnum.WAIVED,
      waivedAt: new Date(),
      createdAt: new Date(),
    }]
    em.userGrammarProgress = Array.from({length: 10}, (_, index) => ({
      user: 'user-id',
      grammar: {id: index + 1, level: LevelEnum.N5},
    }))
    em.userWordProgress = Array.from({length: 6}, (_, index) => ({
      user: 'user-id',
      word: {id: index + 1, jlptLevel: 5},
    }))

    const unlockedLevels = await service.getUnlockedLevels('user-id')

    assert.deepEqual(unlockedLevels, [LevelEnum.N5, LevelEnum.N4])
    assert.equal(em.levelMasteries.length, 1)
    assert.equal(em.levelMasteries[0].masteryType, MasteryTypeEnum.EARNED)
    assert.ok(em.levelMasteries[0].earnedAt)
  })
})

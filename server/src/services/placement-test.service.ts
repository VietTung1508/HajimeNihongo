import {EntityManager} from '@mikro-orm/core'
import {PlacementTest, PlacementTestQuestion, PlacementTestStatus} from '../entities/PlacementTest'
import {UserLevelMastery} from '../entities/UserLevelMastery'
import {UserOnboarding} from '../entities/UserOnboading'
import {Word} from '../entities/Word'
import {Grammar} from '../entities/Grammar'
import {UserWordProgress} from '../entities/UserWordProgress'
import {UserGrammarProgress} from '../entities/UserGrammarProgress'
import {LevelEnum} from '../enums/onboarding.enum'
import {MasteryTypeEnum} from '../enums/mastery.enum'

const LEVEL_PROMOTION_ORDER: LevelEnum[] = [
  LevelEnum.N5,
  LevelEnum.N4,
  LevelEnum.N3,
  LevelEnum.N2,
  LevelEnum.N1,
]

const PASS_THRESHOLD = 80
const GRAMMAR_MASTERY_THRESHOLD = 100
const VOCAB_MASTERY_THRESHOLD = 60
const MAX_ATTEMPTS_BEFORE_FORCE_DOWN = 3

export interface QuizQuestion {
  key: string
  id: number
  type: 'word' | 'grammar'
  question: string
  options: string[]
  correctAnswer: string
}

export interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  passed: boolean
  status: PlacementTestStatus
  unlockedLevels: LevelEnum[]
  forcedToLevel?: LevelEnum
}

export class PlacementTestService {
  constructor(private em: EntityManager) {}

  async generateQuiz(userId: string, level: LevelEnum): Promise<QuizQuestion[]> {
    const masteredWordIds = await this.getMasteredWordIds(userId, level)
    const masteredGrammarIds = await this.getMasteredGrammarIds(userId, level)

    const jlptNum = this.getJlptLevelNumber(level)

    let words = await this.em.find(
      Word,
      masteredWordIds.length > 0
        ? {id: {$nin: masteredWordIds}, jlptLevel: jlptNum}
        : {jlptLevel: jlptNum},
      {orderBy: {id: 'ASC'}, limit: 10},
    )
    // Fallback: user has mastered all words at this level — use the full pool
    if (words.length === 0 && masteredWordIds.length > 0) {
      words = await this.em.find(Word, {jlptLevel: jlptNum}, {orderBy: {id: 'ASC'}, limit: 10})
    }

    const wordDistractors = await this.em.find(
      Word,
      {jlptLevel: jlptNum},
      {orderBy: {id: 'ASC'}, limit: 40},
    )

    let grammars = await this.em.find(
      Grammar,
      masteredGrammarIds.length > 0
        ? {id: {$nin: masteredGrammarIds}, level: level}
        : {level: level},
      {orderBy: {id: 'ASC'}, limit: 10},
    )
    // Fallback: user has mastered all grammar at this level — use the full pool
    if (grammars.length === 0 && masteredGrammarIds.length > 0) {
      grammars = await this.em.find(Grammar, {level: level}, {orderBy: {id: 'ASC'}, limit: 10})
    }

    const grammarDistractors = await this.em.find(
      Grammar,
      {level: level},
      {orderBy: {id: 'ASC'}, limit: 40},
    )

    const questions: QuizQuestion[] = []

    for (const word of words) {
      questions.push({
        key: this.getQuestionKey('word', word.id),
        id: word.id,
        type: 'word',
        question: word.kanji || word.reading,
        options: this.buildOptions(
          word.reading,
          wordDistractors
            .filter((candidate) => candidate.id !== word.id)
            .map((candidate) => candidate.reading),
        ),
        correctAnswer: word.reading,
      })
    }

    for (const grammar of grammars) {
      questions.push({
        key: this.getQuestionKey('grammar', grammar.id),
        id: grammar.id,
        type: 'grammar',
        question: grammar.grammarPoint,
        options: this.buildOptions(
          grammar.meaning,
          grammarDistractors
            .filter((candidate) => candidate.id !== grammar.id)
            .map((candidate) => candidate.meaning),
        ),
        correctAnswer: grammar.meaning,
      })
    }

    return this.shuffleArray(questions)
  }

  async submitQuiz(
    userId: string,
    level: LevelEnum,
    answers: Record<string, boolean>,
    attemptNumber: number,
  ): Promise<QuizResult> {
    const questions = await this.generateQuiz(userId, level)
    const totalQuestions = questions.length
    const unlockedLevels = await this.getUnlockedLevels(userId)

    if (totalQuestions === 0) {
      return {
        score: 0,
        totalQuestions,
        correctAnswers: 0,
        passed: false,
        status: 'failed',
        unlockedLevels,
      }
    }

    let correctAnswers = 0
    const placementTestQuestions: PlacementTestQuestion[] = []

    for (const question of questions) {
      const legacyKey = String(question.id)
      const isCorrect = answers[question.key] ?? answers[legacyKey] ?? false
      if (isCorrect) {
        correctAnswers++
      }
      placementTestQuestions.push({
        id: question.id,
        type: question.type,
        isCorrect,
      })
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = score >= PASS_THRESHOLD

    let status: PlacementTestStatus = 'failed'
    if (passed) {
      status = 'passed'
    } else if (attemptNumber >= MAX_ATTEMPTS_BEFORE_FORCE_DOWN) {
      status = 'forced'
    }

    const placementTest = this.em.create(PlacementTest, {
      user: userId,
      level,
      score,
      attemptNumber,
      questions: placementTestQuestions,
      status,
      createdAt: new Date(),
    })

    await this.em.persistAndFlush(placementTest)

    if (status === 'passed') {
      await this.handlePassedLevel(userId, level)
    } else if (status === 'forced') {
      await this.handleForcedLevelDown(userId, level)
    }

    const updatedUnlockedLevels = await this.getUnlockedLevels(userId)

    return {
      score,
      totalQuestions,
      correctAnswers,
      passed,
      status,
      unlockedLevels: updatedUnlockedLevels,
      forcedToLevel: status === 'forced' ? this.getLowerLevel(level) : undefined,
    }
  }

  async isLevelUnlocked(userId: string, level: LevelEnum): Promise<boolean> {
    const unlockedLevels = await this.getUnlockedLevels(userId)
    return unlockedLevels.includes(level)
  }

  async getUnlockedLevels(userId: string): Promise<LevelEnum[]> {
    const onboarding = await this.em.findOne(UserOnboarding, {user: userId})

    if (!onboarding) {
      return []
    }

    await this.syncEarnedLevelMasteries(userId)

    const unlockedLevels: LevelEnum[] = [onboarding.level]

    // ZERO-level users start from N5 (no grammar exists at ZERO level)
    if (onboarding.level === LevelEnum.ZERO) {
      unlockedLevels.push(LevelEnum.N5)
    }

    const masteries = await this.em.find(UserLevelMastery, {
      user: userId,
    })

    for (const mastery of masteries) {
      if (!unlockedLevels.includes(mastery.level)) {
        unlockedLevels.push(mastery.level)
      }

      if (mastery.masteryType === MasteryTypeEnum.EARNED) {
        const nextLevel = this.getNextLevel(mastery.level)
        if (nextLevel && !unlockedLevels.includes(nextLevel)) {
          unlockedLevels.push(nextLevel)
        }
      }
    }

    return unlockedLevels
  }

  async calculateLevelMastery(userId: string, level: LevelEnum): Promise<number> {
    const grammarMastery = await this.calculateGrammarMastery(userId, level)
    const vocabMastery = await this.calculateVocabMastery(userId, level)

    return Math.round((grammarMastery + vocabMastery) / 2)
  }

  private async handlePassedLevel(userId: string, level: LevelEnum): Promise<void> {
    const existingMastery = await this.em.findOne(UserLevelMastery, {
      user: userId,
      level,
    })

    if (!existingMastery) {
      const mastery = this.em.create(UserLevelMastery, {
        user: userId,
        level,
        masteryType: MasteryTypeEnum.WAIVED,
        waivedAt: new Date(),
        createdAt: new Date(),
      })
      await this.em.persistAndFlush(mastery)
    }

    await this.waiveLowerLevels(userId, level)
    await this.markPlacementTestCompleted(userId)
  }

  private async waiveLowerLevels(userId: string, passedLevel: LevelEnum): Promise<void> {
    const passedLevelIndex = LEVEL_PROMOTION_ORDER.indexOf(passedLevel)

    if (passedLevelIndex === -1) {
      return
    }

    for (let i = 0; i < passedLevelIndex; i++) {
      const levelToWaive = LEVEL_PROMOTION_ORDER[i]
      const existingMastery = await this.em.findOne(UserLevelMastery, {
        user: userId,
        level: levelToWaive,
      })

      if (!existingMastery) {
        const mastery = this.em.create(UserLevelMastery, {
          user: userId,
          level: levelToWaive,
          masteryType: MasteryTypeEnum.WAIVED,
          waivedAt: new Date(),
          createdAt: new Date(),
        })
        await this.em.persistAndFlush(mastery)
      }
    }
  }

  private async handleForcedLevelDown(userId: string, currentLevel: LevelEnum): Promise<void> {
    const lowerLevel = this.getLowerLevel(currentLevel)

    const onboarding = await this.em.findOne(UserOnboarding, {user: userId})
    if (onboarding) {
      if (lowerLevel) {
        onboarding.level = lowerLevel
      }
      onboarding.hasTakenPlacementTest = true
      onboarding.placementTestCompletedAt = new Date()
      await this.em.flush()
    }
  }

  private async markPlacementTestCompleted(userId: string): Promise<void> {
    const onboarding = await this.em.findOne(UserOnboarding, {user: userId})
    if (onboarding) {
      onboarding.hasTakenPlacementTest = true
      onboarding.placementTestCompletedAt = new Date()
      await this.em.flush()
    }
  }

  private getLowerLevel(level: LevelEnum): LevelEnum | undefined {
    const currentIndex = LEVEL_PROMOTION_ORDER.indexOf(level)
    if (currentIndex <= 0) {
      return undefined
    }

    return LEVEL_PROMOTION_ORDER[currentIndex - 1]
  }

  private getNextLevel(level: LevelEnum): LevelEnum | undefined {
    const currentIndex = LEVEL_PROMOTION_ORDER.indexOf(level)
    if (currentIndex === -1 || currentIndex >= LEVEL_PROMOTION_ORDER.length - 1) {
      return undefined
    }

    return LEVEL_PROMOTION_ORDER[currentIndex + 1]
  }

  private async syncEarnedLevelMasteries(userId: string): Promise<void> {
    for (const level of LEVEL_PROMOTION_ORDER) {
      const existingMastery = await this.em.findOne(UserLevelMastery, {
        user: userId,
        level,
      })

      if (existingMastery?.masteryType === MasteryTypeEnum.EARNED) {
        continue
      }

      const grammarMastery = await this.calculateGrammarMastery(userId, level)
      const vocabMastery = await this.calculateVocabMastery(userId, level)

      if (
        grammarMastery >= GRAMMAR_MASTERY_THRESHOLD &&
        vocabMastery >= VOCAB_MASTERY_THRESHOLD
      ) {
        if (existingMastery) {
          existingMastery.masteryType = MasteryTypeEnum.EARNED
          existingMastery.earnedAt = new Date()
          await this.em.flush()
          continue
        }

        const mastery = this.em.create(UserLevelMastery, {
          user: userId,
          level,
          masteryType: MasteryTypeEnum.EARNED,
          earnedAt: new Date(),
          createdAt: new Date(),
        })
        await this.em.persistAndFlush(mastery)
      }
    }
  }

  private async calculateGrammarMastery(userId: string, level: LevelEnum): Promise<number> {
    const totalGrammar = await this.em.count(Grammar, {
      level: level,
    })

    if (totalGrammar === 0) {
      return 0
    }

    const filteredMastered = await this.em
      .find(UserGrammarProgress, {user: userId}, {populate: ['grammar']})
      .then((progresses) =>
        progresses.filter((p) => {
          const grammar = typeof p.grammar === 'object' ? p.grammar : null
          return grammar && grammar.level === level
        }),
      )

    return Math.round((filteredMastered.length / totalGrammar) * 100)
  }

  private async calculateVocabMastery(userId: string, level: LevelEnum): Promise<number> {
    const jlptNum = this.getJlptLevelNumber(level)

    if (jlptNum === null) {
      return 0
    }

    const totalWords = await this.em.count(Word, {
      jlptLevel: jlptNum,
    })

    if (totalWords === 0) {
      return 0
    }

    const masteredWords = await this.em
      .find(UserWordProgress, {user: userId}, {populate: ['word']})
      .then((progresses) =>
        progresses.filter((p) => {
          const word = typeof p.word === 'object' ? p.word : null
          return word && word.jlptLevel === jlptNum
        }),
      )

    return Math.round((masteredWords.length / totalWords) * 100)
  }

  private async getMasteredWordIds(userId: string, level: LevelEnum): Promise<number[]> {
    const progresses = await this.em.find(UserWordProgress, {user: userId}, {populate: ['word']})

    const jlptNum = this.getJlptLevelNumber(level)
    return progresses
      .filter((p) => {
        const word = typeof p.word === 'object' ? p.word : null
        return word && word.jlptLevel === jlptNum
      })
      .map((p) => p.word.id)
  }

  private async getMasteredGrammarIds(userId: string, level: LevelEnum): Promise<number[]> {
    const progresses = await this.em.find(UserGrammarProgress, {
      user: userId,
    }, {populate: ['grammar']})

    return progresses
      .filter((p) => {
        const grammar = typeof p.grammar === 'object' ? p.grammar : null
        return grammar && grammar.level === level
      })
      .map((p) => p.grammar.id)
  }

  private getJlptLevelNumber(level: LevelEnum): number | null {
    switch (level) {
      case LevelEnum.N5:
        return 5
      case LevelEnum.N4:
        return 4
      case LevelEnum.N3:
        return 3
      case LevelEnum.N2:
        return 2
      case LevelEnum.N1:
        return 1
      default:
        return null
    }
  }

  private getQuestionKey(type: 'word' | 'grammar', id: number): string {
    return `${type}:${id}`
  }

  private buildOptions(correctAnswer: string, distractors: string[]): string[] {
    const uniqueDistractors = Array.from(
      new Set(distractors.filter((option) => option && option !== correctAnswer)),
    ).slice(0, 3)

    return this.shuffleArray([correctAnswer, ...uniqueDistractors])
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

import {EntityManager} from '@mikro-orm/core'
import {DailyLearn} from '../entities/DailyLearn'
import {DailyLearnItem} from '../entities/DailyLearnItem'
import {DailyLearnStatus} from '../enums/learn.enum'
import {Streak} from '../entities/Streak'
import {UserOnboarding} from '../entities/UserOnboading'
import {Word} from '../entities/Word'
import {Grammar} from '../entities/Grammar'
import {UserWordProgress} from '../entities/UserWordProgress'
import {UserGrammarProgress} from '../entities/UserGrammarProgress'
import {StudyPaceEnum, StudyPreferenceEnum, LevelEnum} from '../enums/onboarding.enum'

interface GenerationConfig {
  wordCount: number
  grammarCount: number
}

const PACE_PREFERENCE_MATRIX: Record<StudyPaceEnum, Record<StudyPreferenceEnum, GenerationConfig>> = {
  [StudyPaceEnum.RELAX]: {
    [StudyPreferenceEnum.GRAMMAR]: {wordCount: 0, grammarCount: 2},
    [StudyPreferenceEnum.VOCABULARY]: {wordCount: 2, grammarCount: 0},
    [StudyPreferenceEnum.BOTH]: {wordCount: 1, grammarCount: 1},
  },
  [StudyPaceEnum.DETERMINED]: {
    [StudyPreferenceEnum.GRAMMAR]: {wordCount: 0, grammarCount: 4},
    [StudyPreferenceEnum.VOCABULARY]: {wordCount: 4, grammarCount: 0},
    [StudyPreferenceEnum.BOTH]: {wordCount: 3, grammarCount: 1},
  },
  [StudyPaceEnum.RIGOROUS]: {
    [StudyPreferenceEnum.GRAMMAR]: {wordCount: 0, grammarCount: 6},
    [StudyPreferenceEnum.VOCABULARY]: {wordCount: 6, grammarCount: 0},
    [StudyPreferenceEnum.BOTH]: {wordCount: 4, grammarCount: 2},
  },
}

const LEVEL_PROMOTION_ORDER: LevelEnum[] = [
  LevelEnum.N5,
  LevelEnum.N4,
  LevelEnum.N3,
  LevelEnum.N2,
  LevelEnum.N1,
]

export class DailyLearnGenerationService {
  constructor(private em: EntityManager) {}

  async generateForUser(userId: string): Promise<DailyLearn | null> {
    console.log('[generateForUser] Starting for user:', userId)

    const onboarding = await this.em.findOne(UserOnboarding, {user: userId})
    if (!onboarding) {
      console.log('[generateForUser] No onboarding found for user:', userId)
      return null
    }

    console.log('[generateForUser] Onboarding found:', { level: onboarding.level, studyPace: onboarding.studyPace, studyPreference: onboarding.studyPreference })

    return this.generateDailyLearnInternal(userId, onboarding, false)
  }

  async generateExtraBatch(userId: string): Promise<DailyLearn | null> {
    const onboarding = await this.em.findOne(UserOnboarding, {user: userId})
    if (!onboarding) {
      return null
    }

    return this.generateDailyLearnInternal(userId, onboarding, true)
  }

  private async generateDailyLearnInternal(
    userId: string,
    onboarding: UserOnboarding,
    isExtraBatch: boolean
  ): Promise<DailyLearn | null> {
    const config = PACE_PREFERENCE_MATRIX[onboarding.studyPace][onboarding.studyPreference]

    console.log('[generateDailyLearnInternal] Config:', config)

    const {words, grammars} = await this.selectItems(
      userId,
      onboarding.level,
      config.wordCount,
      config.grammarCount,
    )

    console.log('[generateDailyLearnInternal] Selected items:', { wordsCount: words.length, grammarsCount: grammars.length })

    if (words.length === 0 && grammars.length === 0) {
      console.log('[generateDailyLearnInternal] No items selected, returning null')
      return null
    }

    const dailyLearn = this.em.create(DailyLearn, {
      user: userId,
      generatedDate: new Date(),
      status: DailyLearnStatus.PENDING,
      isExtraBatch,
    })

    await this.em.persistAndFlush(dailyLearn)

    const items: DailyLearnItem[] = []

    for (const word of words) {
      const item = this.em.create(DailyLearnItem, {
        dailyLearn,
        word,
      })
      items.push(item)
    }

    for (const grammar of grammars) {
      const item = this.em.create(DailyLearnItem, {
        dailyLearn,
        grammar,
      })
      items.push(item)
    }

    await this.em.persistAndFlush(items)

    await this.ensureStreak(userId)

    return dailyLearn
  }

  private async selectItems(
    userId: string,
    currentLevel: LevelEnum,
    wordCount: number,
    grammarCount: number,
  ): Promise<{words: Word[]; grammars: Grammar[]}> {
    let level = currentLevel
    let words: Word[] = []
    let grammars: Grammar[] = []
    let maxRetries = LEVEL_PROMOTION_ORDER.length

    while (maxRetries > 0 && (words.length < wordCount || grammars.length < grammarCount)) {
      const masteredWordIds = await this.getMasteredWordIds(userId, level)
      const masteredGrammarIds = await this.getMasteredGrammarIds(userId, level)

      if (words.length < wordCount) {
        const neededWords = wordCount - words.length

        const commonWords = await this.em.find(
          Word,
          masteredWordIds.length > 0
            ? {
                id: {$nin: masteredWordIds},
                jlptLevel: this.getJlptLevelNumber(level),
                isCommon: true,
              }
            : {
                jlptLevel: this.getJlptLevelNumber(level),
                isCommon: true,
              },
          {orderBy: {id: 'ASC'}, limit: neededWords},
        )

        words.push(...commonWords)

        if (words.length < wordCount) {
          const remainingWords = wordCount - words.length
          const excludedIds = [...masteredWordIds, ...commonWords.map(w => w.id)]
          const additionalWords = await this.em.find(
            Word,
            excludedIds.length > 0
              ? {
                  id: {$nin: excludedIds},
                  jlptLevel: this.getJlptLevelNumber(level),
                }
              : {
                  jlptLevel: this.getJlptLevelNumber(level),
                },
            {orderBy: {id: 'ASC'}, limit: remainingWords},
          )

          words.push(...additionalWords)
        }
      }

      if (grammars.length < grammarCount) {
        const neededGrammar = grammarCount - grammars.length

        const availableGrammar = await this.em.find(
          Grammar,
          masteredGrammarIds.length > 0
            ? {
                id: {$nin: masteredGrammarIds},
                level: level,
              }
            : {
                level: level,
              },
          {orderBy: {id: 'ASC'}, limit: neededGrammar},
        )

        grammars.push(...availableGrammar)
      }

      if (words.length >= wordCount && grammars.length >= grammarCount) {
        break
      }

      const currentIndex = LEVEL_PROMOTION_ORDER.indexOf(level)
      if (currentIndex < LEVEL_PROMOTION_ORDER.length - 1) {
        level = LEVEL_PROMOTION_ORDER[currentIndex + 1]
      } else {
        break
      }

      maxRetries--
    }

    return {words, grammars}
  }

  private async getMasteredWordIds(userId: string, level: LevelEnum): Promise<number[]> {
    const progresses = await this.em.find(
      UserWordProgress,
      {
        user: userId,
      },
      {populate: ['word']},
    )

    const jlptNum = this.getJlptLevelNumber(level)
    return progresses
      .filter(p => {
        const word = typeof p.word === 'object' ? p.word : null
        return word && word.jlptLevel === jlptNum
      })
      .map(p => p.word.id)
  }

  private async getMasteredGrammarIds(userId: string, level: LevelEnum): Promise<number[]> {
    const progresses = await this.em.find(
      UserGrammarProgress,
      {
        user: userId,
      },
      {populate: ['grammar']},
    )

    return progresses
      .filter(p => {
        const grammar = typeof p.grammar === 'object' ? p.grammar : null
        return grammar && grammar.level === level
      })
      .map(p => p.grammar.id)
  }

  private getJlptLevelNumber(level: LevelEnum): number | null {
    switch (level) {
      case LevelEnum.N5: return 5
      case LevelEnum.N4: return 4
      case LevelEnum.N3: return 3
      case LevelEnum.N2: return 2
      case LevelEnum.N1: return 1
      default: return null
    }
  }

  private async ensureStreak(userId: string): Promise<void> {
    const existing = await this.em.findOne(Streak, {user: userId})

    if (!existing) {
      const streak = this.em.create(Streak, {
        user: userId,
        currentStreak: 0,
        longestStreak: 0,
        freezeAvailableAt: new Date(),
        freezesUsed: 0,
      })
      await this.em.persistAndFlush(streak)
    }
  }
}

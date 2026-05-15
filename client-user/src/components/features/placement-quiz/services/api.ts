import {apiClient} from '@/lib/api/apiClient'
import {LevelEnum} from '@/components/features/onboarding/types'
import type {QuizAnswerMap, QuizResult, StartQuizResponse} from '../types'

export const placementTestApi = {
  startQuiz: async (level: LevelEnum): Promise<StartQuizResponse> => {
    const response = await apiClient.post<StartQuizResponse>('/placement-test/start', {level})
    return response.data
  },

  submitQuiz: async (
    level: LevelEnum,
    answers: QuizAnswerMap,
    attemptNumber: number,
  ): Promise<QuizResult> => {
    const response = await apiClient.post<QuizResult>('/placement-test/submit', {
      level,
      answers,
      attemptNumber,
    })
    return response.data
  },

  getQuizHistory: async () => {
    const response = await apiClient.get('/placement-test/history')
    return response.data
  },

  checkLevelUnlocked: async (level: LevelEnum): Promise<{level: LevelEnum; unlocked: boolean}> => {
    const response = await apiClient.get('/placement-test/check', {params: {level}})
    return response.data
  },

  getUnlockedLevels: async (): Promise<{levels: LevelEnum[]}> => {
    const response = await apiClient.get('/placement-test/unlocked')
    return response.data
  },
}

import {LevelEnum} from '@/components/features/onboarding/types'

export interface QuizQuestion {
  key: string
  id: number
  type: 'word' | 'grammar'
  question: string
  options: string[]
  correctAnswer: string
}

export type QuizAnswerMap = Record<string, boolean>

export interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  passed: boolean
  status: 'passed' | 'failed' | 'forced'
  unlockedLevels: LevelEnum[]
  forcedToLevel?: LevelEnum
}

export interface StartQuizResponse {
  attemptNumber: number
  totalQuestions: number
  questions: QuizQuestion[]
}

export interface PlacementQuizState {
  level: LevelEnum
  questions: QuizQuestion[]
  answers: QuizAnswerMap
  selectedAnswers: Record<string, string>
  currentIndex: number
  isSubmitting: boolean
  attemptNumber: number
}

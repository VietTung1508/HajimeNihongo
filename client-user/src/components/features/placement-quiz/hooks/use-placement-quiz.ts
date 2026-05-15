'use client'

import {useCallback, useState} from 'react'
import {toast} from 'sonner'
import {LevelEnum} from '@/components/features/onboarding/types'
import {placementTestApi} from '../services/api'
import type {PlacementQuizState, QuizResult} from '../types'

export function usePlacementQuiz() {
  const [state, setState] = useState<PlacementQuizState>({
    level: LevelEnum.N5,
    questions: [],
    answers: {},
    selectedAnswers: {},
    currentIndex: 0,
    isSubmitting: false,
    attemptNumber: 1,
  })
  const [result, setResult] = useState<QuizResult | null>(null)

  const startQuiz = useCallback(async (level: LevelEnum) => {
    try {
      const response = await placementTestApi.startQuiz(level)
      setState({
        level,
        questions: response.questions,
        answers: {},
        selectedAnswers: {},
        currentIndex: 0,
        isSubmitting: false,
        attemptNumber: response.attemptNumber,
      })
      setResult(null)
    } catch (error) {
      toast.error('Failed to start placement test')
      console.error(error)
    }
  }, [])

  const answerQuestion = useCallback((questionKey: string, answer: string, correctAnswer: string) => {
    setState((prev) => ({
      ...prev,
      answers: {...prev.answers, [questionKey]: answer === correctAnswer},
      selectedAnswers: {...prev.selectedAnswers, [questionKey]: answer},
    }))
  }, [])

  const goToPreviousQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }))
  }, [])

  const goToNextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
    }))
  }, [])

  const submitQuiz = useCallback(async () => {
    setState((prev) => ({...prev, isSubmitting: true}))

    try {
      const response = await placementTestApi.submitQuiz(
        state.level,
        state.answers,
        state.attemptNumber,
      )
      setResult(response)

      if (response.status === 'passed') {
        toast.success(`Placement test passed. ${response.unlockedLevels.join(', ')} unlocked.`)
      } else if (response.status === 'forced' && response.forcedToLevel) {
        toast.warning(`Your starting level was adjusted to ${response.forcedToLevel}.`)
      } else {
        toast.error(`Score: ${response.score}%. You need 80% to pass.`)
      }
    } catch (error) {
      toast.error('Failed to submit placement test')
      console.error(error)
    } finally {
      setState((prev) => ({...prev, isSubmitting: false}))
    }
  }, [state.answers, state.attemptNumber, state.level])

  const retryQuiz = useCallback(async () => {
    await startQuiz(state.level)
  }, [startQuiz, state.level])

  const lowerLevel = useCallback(async (level: LevelEnum) => {
    await startQuiz(level)
  }, [startQuiz])

  return {
    state,
    result,
    startQuiz,
    answerQuestion,
    goToPreviousQuestion,
    goToNextQuestion,
    submitQuiz,
    retryQuiz,
    lowerLevel,
    isComplete: state.questions.length > 0 && Object.keys(state.answers).length === state.questions.length,
  }
}

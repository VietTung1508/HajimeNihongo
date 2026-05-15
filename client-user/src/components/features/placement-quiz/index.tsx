'use client'

import {useEffect} from 'react'
import type {ReactNode} from 'react'
import {Crown, Loader2, Lock, XCircle} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'
import {LevelEnum} from '@/components/features/onboarding/types'
import {usePlacementQuiz} from './hooks/use-placement-quiz'
import type {QuizResult} from './types'

interface PlacementQuizProps {
  level: LevelEnum
  onComplete: (result: QuizResult) => void
}

const LEVELS = [LevelEnum.N5, LevelEnum.N4, LevelEnum.N3, LevelEnum.N2, LevelEnum.N1]

export function PlacementQuiz({level, onComplete}: PlacementQuizProps) {
  const {
    state,
    result,
    startQuiz,
    answerQuestion,
    goToPreviousQuestion,
    goToNextQuestion,
    submitQuiz,
    retryQuiz,
    lowerLevel,
    isComplete,
  } =
    usePlacementQuiz()

  useEffect(() => {
    startQuiz(level)
  }, [level, startQuiz])

  const currentQuestion = state.questions[state.currentIndex]

  if (state.questions.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  if (result) {
    return (
      <QuizResultView
        result={result}
        level={state.level}
        onComplete={onComplete}
        onLower={lowerLevel}
        onRetry={retryQuiz}
      />
    )
  }

  const progress = ((Object.keys(state.answers).length) / state.questions.length) * 100
  const isFirstQuestion = state.currentIndex === 0
  const isLastQuestion = state.currentIndex === state.questions.length - 1

  return (
    <Card className="mx-auto max-w-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Question {Math.min(state.currentIndex + 1, state.questions.length)} of {state.questions.length}
          </span>
          <span>{state.level} placement test</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {currentQuestion && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              {currentQuestion.type === 'word' ? 'Vocabulary' : 'Grammar'}
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option) => {
              const selected = state.selectedAnswers[currentQuestion.key] === option
              return (
                <Button
                  key={option}
                  type="button"
                  variant={selected ? 'default' : 'outline'}
                  className="h-auto justify-start whitespace-normal px-4 py-3 text-left"
                  onClick={() => answerQuestion(currentQuestion.key, option, currentQuestion.correctAnswer)}
                >
                  {option}
                </Button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={isFirstQuestion || state.isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goToNextQuestion}
              disabled={isLastQuestion || state.isSubmitting}
            >
              Next
            </Button>
          </div>

          <Button onClick={submitQuiz} className="w-full" disabled={!isComplete || state.isSubmitting}>
            {state.isSubmitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        </div>
      )}
    </Card>
  )
}

function QuizResultView({
  result,
  level,
  onRetry,
  onLower,
  onComplete,
}: {
  result: QuizResult
  level: LevelEnum
  onRetry: () => void
  onLower: (level: LevelEnum) => void
  onComplete: (result: QuizResult) => void
}) {
  const levelIndex = LEVELS.indexOf(level)
  const lowerLevel = levelIndex > 0 ? LEVELS[levelIndex - 1] : null

  if (result.status === 'passed') {
    return (
      <ResultCard
        icon={<Crown className="h-14 w-14 fill-amber-500 text-amber-500" />}
        title="Level Unlocked"
        description={`${result.unlockedLevels.join(', ')} are now available.`}
      >
        <Button onClick={() => onComplete(result)} className="w-full">
          Continue to Dashboard
        </Button>
      </ResultCard>
    )
  }

  if (result.status === 'forced') {
    return (
      <ResultCard
        icon={<Lock className="h-14 w-14 text-slate-400" />}
        title="Level Adjusted"
        description={`Your starting level is now ${result.forcedToLevel ?? lowerLevel ?? LevelEnum.N5}.`}
      >
        <Button onClick={() => onComplete(result)} className="w-full">
          Continue to Dashboard
        </Button>
      </ResultCard>
    )
  }

  return (
    <ResultCard
      icon={<XCircle className="h-14 w-14 text-red-500" />}
      title="Keep Practicing"
      description={`Score: ${result.score}% (${result.correctAnswers}/${result.totalQuestions} correct).`}
    >
      <div className="space-y-3">
        <Button onClick={onRetry} className="w-full">
          Try Again
        </Button>
        {lowerLevel && (
          <Button onClick={() => onLower(lowerLevel)} variant="outline" className="w-full">
            Try {lowerLevel} Instead
          </Button>
        )}
      </div>
    </ResultCard>
  )
}

function ResultCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="mx-auto max-w-md border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {children}
    </Card>
  )
}

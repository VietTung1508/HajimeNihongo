'use client'

import {useState, useEffect, useCallback} from 'react'
import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {CheckCircle2, XCircle, RotateCcw, Trash2} from 'lucide-react'
import {cn} from '@/lib/utils'
import {ReviewItem, isWordReviewItem, isGrammarReviewItem} from '../types'
import {generateOptions, type Option} from '../utils/quiz-options'

interface QuizCardProps {
  item: ReviewItem
  onAnswer: (correct: boolean) => void
  onRemove: () => void
  onNext: () => void
}

export function QuizCard({item, onAnswer, onRemove, onNext}: QuizCardProps) {
  const [options, setOptions] = useState<Option[]>([])
  const [hasAnswered, setHasAnswered] = useState(false)
  const [showNext, setShowNext] = useState(false)

  useEffect(() => {
    let correctAnswer = ''

    if (isWordReviewItem(item)) {
      // For words, use the first meaning
      correctAnswer = item.meanings?.[0] || ''
    } else if (isGrammarReviewItem(item)) {
      // For grammar, use the meaning
      correctAnswer = item.meaning || ''
    }

    if (correctAnswer) {
      setOptions(generateOptions(correctAnswer))
      setHasAnswered(false)
      setShowNext(false)
    }
  }, [item])

  const handleOptionClick = useCallback(
    (optionId: number) => {
      if (hasAnswered) return // Prevent multiple clicks

      const selectedOption = options.find(opt => opt.id === optionId)
      if (!selectedOption) return

      const updatedOptions = options.map(opt => ({
        ...opt,
        status: opt.id === optionId
          ? (opt.isCorrect ? 'correct' : 'incorrect')
          : 'idle' as Option['status'],
      }))

      setOptions(updatedOptions)
      setHasAnswered(true)

      onAnswer(selectedOption.isCorrect)

      if (selectedOption.isCorrect) {
        setShowNext(true)
      }
    },
    [options, hasAnswered, onAnswer]
  )

  const handleRetry = useCallback(() => {
    let correctAnswer = ''

    if (isWordReviewItem(item)) {
      correctAnswer = item.meanings?.[0] || ''
    } else if (isGrammarReviewItem(item)) {
      correctAnswer = item.meaning || ''
    }

    if (correctAnswer) {
      setOptions(generateOptions(correctAnswer))
      setHasAnswered(false)
      setShowNext(false)
    }
  }, [item])

  const handleRemove = useCallback(() => {
    onRemove()
    onNext()
  }, [onRemove, onNext])

  const handleNext = useCallback(() => {
    onNext()
  }, [onNext])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (hasAnswered && showNext) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleNext()
        }
        return
      }

      if (!hasAnswered) {
        const key = parseInt(e.key)
        if (key >= 1 && key <= 4) {
          e.preventDefault()
          handleOptionClick(options[key - 1]?.id)
        }
      } else if (!showNext) {
        if (e.key === 'Enter') {
          e.preventDefault()
          handleRetry()
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          handleRemove()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [hasAnswered, showNext, options, handleOptionClick, handleRetry, handleNext, handleRemove])

  const renderFront = () => {
    if (isWordReviewItem(item)) {
      return (
        <div className="text-center">
          <div className="mb-4 text-6xl font-bold text-foreground">
            {item.kanji || item.reading}
          </div>
          {item.kanji && item.reading && (
            <div className="text-2xl text-muted-foreground">
              {item.reading}
            </div>
          )}
        </div>
      )
    } else if (isGrammarReviewItem(item)) {
      return (
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold text-foreground">
            {item.grammarPoint}
          </div>
          <div className="text-xl text-muted-foreground">
            {item.exampleJp}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full max-w-2xl border-2 shadow-lg">
      <CardContent className="p-8 space-y-6">
        <div className="rounded-lg bg-muted p-8">
          {renderFront()}
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={hasAnswered}
              className={cn(
                'w-full rounded-lg border-2 p-4 text-left transition-all',
                'flex items-center gap-3',
                'hover:border-primary/50 hover:bg-muted/50',
                'disabled:cursor-not-allowed',
                {
                  'border-green-500 bg-green-50 dark:bg-green-950':
                    option.status === 'correct',
                  'border-red-500 bg-red-50 dark:bg-red-950':
                    option.status === 'incorrect',
                  'border-border bg-background': option.status === 'idle',
                }
              )}
            >
              <div className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full font-bold',
                {
                  'bg-green-500 text-white': option.status === 'correct',
                  'bg-red-500 text-white': option.status === 'incorrect',
                  'bg-muted text-foreground': option.status === 'idle',
                }
              )}>
                {index + 1}
              </div>

              <span className="flex-1 text-lg font-medium">
                {option.text}
              </span>

              {option.status === 'correct' && (
                <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
              )}
              {option.status === 'incorrect' && (
                <XCircle className="size-6 text-red-600 dark:text-red-400" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 size-4" />
            Remove
          </Button>

          {hasAnswered && !showNext ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleRetry}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              Try Again
            </Button>
          ) : showNext ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
            >
              Next →
            </Button>
          ) : null}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {!hasAnswered ? (
            <span>Press 1-4 to select • Enter to continue • Delete to remove</span>
          ) : !showNext ? (
            <span>Press Enter to retry • Delete to remove</span>
          ) : (
            <span>Press Enter or Space for next • Delete to remove</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import {useState, useEffect, useRef} from 'react'
import {isKanji, toHiragana} from 'wanakana'
import {X, Lightbulb} from 'lucide-react'
import {ReviewItem} from '../types'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent} from '@/components/ui/card'

interface InputCardProps {
  item: ReviewItem
  onAnswer: (correct: boolean) => void
  onRemove: () => void
  onNext: () => void
}

export function InputCard({item, onAnswer, onRemove, onNext}: InputCardProps) {
  const [userInput, setUserInput] = useState('')
  const [error, setError] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isRevealed) {
      inputRef.current?.focus()
    }
  }, [isRevealed])

  const getPrompt = () => {
    if (item.type === 'word' && item.meanings) {
      return item.meanings.join(', ')
    }
    if (item.type === 'grammar' && item.meaning) {
      return item.meaning
    }
    return ''
  }

  const validateAnswer = (input: string): boolean => {
    const trimmedInput = input.trim()

    if (item.type === 'word') {
      const kanji = item.kanji?.trim() || ''
      const reading = item.reading?.trim() || ''

      if (kanji && trimmedInput === kanji) {
        return true
      }

      if (reading) {
        const inputHiragana = toHiragana(trimmedInput)
        const readingHiragana = toHiragana(reading)
        return inputHiragana === readingHiragana
      }

      return false
    }

    if (item.type === 'grammar') {
      const normalizedInput = trimmedInput.toLowerCase().replace(/\s+/g, '')
      const normalizedPoint = (item.grammarPoint || '').toLowerCase().replace(/\s+/g, '')
      return normalizedInput === normalizedPoint
    }

    return false
  }

  const getHint = () => {
    if (item.type === 'word') {
      return item.kanji ? `Kanji: ${item.kanji}` : `Reading: ${item.reading}`
    }
    if (item.type === 'grammar') {
      return item.grammarPoint
    }
    return ''
  }

  const handleSubmit = () => {
    if (isRevealed) {
      handleNext()
      return
    }

    if (!userInput.trim()) {
      setError('Please enter an answer')
      return
    }

    if (validateAnswer(userInput)) {
      setIsRevealed(true)
      onAnswer(true)
      setError('')
    } else {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)

      if (newAttempts >= 3) {
        setShowHint(true)
        setError(`Incorrect. Hint: ${getHint()}`)
      } else {
        setError(`Incorrect. Try again (${3 - newAttempts} attempts left)`)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNext = () => {
    setUserInput('')
    setError('')
    setShowHint(false)
    setIsRevealed(false)
    setFailedAttempts(0)
    onNext()
  }

  const getCorrectAnswer = () => {
    if (item.type === 'word') {
      return item.kanji ? `${item.kanji} (${item.reading})` : item.reading
    }
    return item.grammarPoint
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 shadow-lg">
      <CardContent className="p-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3 font-medium">
            {item.type === 'word' ? 'Translate to Japanese:' : 'Type the grammar point:'}
          </p>
          <p className="text-2xl font-bold">
            {getPrompt()}
          </p>
        </div>

        {!isRevealed ? (
          <div className="space-y-6">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={item.type === 'word' ? 'Type in Japanese...' : 'Type the grammar point...'}
                className="text-lg h-14 px-4 border-2 focus-visible:ring-2 transition-all"
                disabled={isRevealed}
              />
            </div>

            {error && (
              <div className={`p-4 rounded-lg border-2 ${showHint ? 'bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700' : 'bg-destructive/10 border-destructive/30'}`}>
                <div className="flex items-start gap-3">
                  {showHint && <Lightbulb className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" size={20} />}
                  <p className={`text-sm font-medium ${showHint ? 'text-amber-900 dark:text-amber-200' : 'text-destructive'}`}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              Submit Answer
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl dark:from-green-950 dark:to-green-900 dark:border-green-700">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-green-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Excellent! Correct answer!
                </p>
              </div>
              <p className="text-xl font-bold text-green-900 dark:text-green-100 ml-11">
                {getCorrectAnswer()}
              </p>
            </div>

            <Button
              onClick={handleNext}
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              Continue to Next →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

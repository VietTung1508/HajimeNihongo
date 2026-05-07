'use client'

import {useState} from 'react'
import {ReviewItem} from '../types'
import {FlashcardCard} from './FlashcardCard'
import {QuizCard} from './QuizCard'
import {InputCard} from './InputCard'
import {CreditCard, CircleHelp, Keyboard} from 'lucide-react'
import {cn} from '@/lib/utils'

export type CardMode = 'flashcard' | 'quiz' | 'input'

interface HybridCardProps {
  item: ReviewItem
  onAnswer: (correct: boolean) => void
  onRemove: () => void
  onNext: () => void
}

interface ModeOption {
  id: CardMode
  icon: typeof CreditCard
  label: string
  color: string
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'flashcard',
    icon: CreditCard,
    label: 'Flashcard',
    color: 'text-blue-500',
  },
  {
    id: 'quiz',
    icon: CircleHelp,
    label: 'Quiz',
    color: 'text-purple-500',
  },
  {
    id: 'input',
    icon: Keyboard,
    label: 'Input',
    color: 'text-green-500',
  },
]

export function HybridCard({item, onAnswer, onRemove, onNext}: HybridCardProps) {
  const [currentMode, setCurrentMode] = useState<CardMode>('flashcard')

  const handleModeChange = (mode: CardMode) => {
    setCurrentMode(mode)
  }

  const renderModeSwitcher = () => {
    return (
      <div className="mt-6 border-t pt-4">
        <p className="text-xs text-muted-foreground mb-3 text-center">
          Switch mode for this card
        </p>
        <div className="flex justify-center gap-2">
          {MODE_OPTIONS.map((mode) => {
            const Icon = mode.icon
            const isActive = currentMode === mode.id

            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                  'border-2',
                  'hover:bg-muted/50',
                  {
                    [mode.color]: isActive,
                    'border-current': isActive,
                    'bg-muted/30': isActive,
                    'text-muted-foreground border-border': !isActive,
                  }
                )}
                aria-pressed={isActive}
                aria-label={`Switch to ${mode.label} mode`}
              >
                <Icon className="size-4" />
                <span className="text-sm font-medium">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderCurrentCard = () => {
    switch (currentMode) {
      case 'flashcard':
        return <FlashcardCard item={item} onAnswer={onAnswer} onRemove={onRemove} onNext={onNext} />
      case 'quiz':
        return <QuizCard item={item} onAnswer={onAnswer} onRemove={onRemove} onNext={onNext} />
      case 'input':
        return <InputCard item={item} onAnswer={onAnswer} onRemove={onRemove} onNext={onNext} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-w-4xl">
      {/* Current Card Component */}
      <div className="w-full flex items-center justify-center">
        {renderCurrentCard()}
      </div>

      {renderModeSwitcher()}
    </div>
  )
}

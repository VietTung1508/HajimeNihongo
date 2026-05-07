'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ReviewItem, isWordReviewItem, isGrammarReviewItem } from '../types'
import { Check, X, RotateCw } from 'lucide-react'

interface FlashcardCardProps {
  item: ReviewItem
  onAnswer: (correct: boolean) => void
  onRemove: () => void
  onNext: () => void
}

function FlashcardCardContent({ item, onAnswer, onRemove, onNext }: FlashcardCardProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false)

  const handleCardClick = useCallback(() => {
    if (!answeredCorrectly) {
      setIsRevealed(prev => !prev)
    }
  }, [answeredCorrectly])

  const handleCorrect = () => {
    setAnsweredCorrectly(true)
    onAnswer(true)
  }

  const handleRemove = () => {
    onRemove()
  }

  const handleNext = () => {
    if (answeredCorrectly) {
      onNext()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsRevealed(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderFront = () => {
    if (isWordReviewItem(item)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-6xl font-bold text-foreground tracking-tight mb-6">
            {item.kanji || item.reading}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <RotateCw className="w-4 h-4" />
            <span>Press Space or click to reveal</span>
          </div>
        </div>
      )
    }

    if (isGrammarReviewItem(item)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-5">
          <div className="text-4xl font-bold text-foreground tracking-tight text-center">
            {item.grammarPoint}
          </div>
          <div className="text-base text-muted-foreground text-center max-w-sm leading-relaxed">
            {item.exampleJp}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <RotateCw className="w-4 h-4" />
            <span>Press Space or click to reveal</span>
          </div>
        </div>
      )
    }

    return null
  }

  const renderBack = () => {
    if (isWordReviewItem(item)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-foreground tracking-tight">
              {item.kanji || item.reading}
            </div>
            {item.kanji && (
              <div className="text-xl text-muted-foreground">
                {item.reading}
              </div>
            )}
            <div className="text-lg text-card-foreground">
              {item.meanings?.[0] || 'No meaning available'}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCorrect()
              }}
              className="flex items-center gap-2 px-5 py-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              disabled={answeredCorrectly}
            >
              <Check className="w-4 h-4" />
              Got it
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="flex items-center gap-2 px-5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-all font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Skip
            </button>
          </div>

          {answeredCorrectly && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="px-6 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-all font-medium text-sm"
            >
              Next →
            </button>
          )}
        </div>
      )
    }

    if (isGrammarReviewItem(item)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-5">
          <div className="text-center space-y-3 max-w-sm">
            <div className="text-4xl font-bold text-foreground tracking-tight">
              {item.grammarPoint}
            </div>
            <div className="text-lg text-card-foreground">
              {item.meaning}
            </div>
            <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
              <div className="text-base text-foreground mb-1.5 leading-relaxed">
                {item.exampleJp}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.exampleEn}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCorrect()
              }}
              className="flex items-center gap-2 px-5 py-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              disabled={answeredCorrectly}
            >
              <Check className="w-4 h-4" />
              Got it
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="flex items-center gap-2 px-5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-all font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Skip
            </button>
          </div>

          {answeredCorrectly && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="px-6 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-all font-medium text-sm"
            >
              Next →
            </button>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div
      onClick={handleCardClick}
      className={`relative w-full h-[500px] transition-transform duration-500 ${
        answeredCorrectly ? '' : 'cursor-pointer'
      }`}
      style={{
        transformStyle: 'preserve-3d',
        transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      <div
        className="absolute inset-0 backface-hidden bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="absolute top-4 right-4 px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {item.type}
        </div>
        {renderFront()}
      </div>

      <div
        className="absolute inset-0 backface-hidden bg-card rounded-xl border border-border shadow-sm"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        <div className="absolute top-4 right-4 px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {item.type}
        </div>
        {renderBack()}
      </div>
    </div>
  )
}

export function FlashcardCard(props: FlashcardCardProps) {
  const cardKey = useMemo(() => {
    if (isWordReviewItem(props.item)) {
      return `word-${props.item.id}`
    }
    if (isGrammarReviewItem(props.item)) {
      return `grammar-${props.item.id}`
    }
    return 'card'
  }, [props.item])

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ perspective: '1000px' }}>
      <FlashcardCardContent {...props} key={cardKey} />
    </div>
  )
}

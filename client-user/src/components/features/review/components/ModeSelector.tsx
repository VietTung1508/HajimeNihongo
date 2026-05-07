'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {
  CreditCard,
  CircleHelp,
  Keyboard,
  Shuffle,
  Sparkles,
  Brain,
  Target,
  Zap
} from 'lucide-react'

export type ReviewMode = 'flashcard' | 'quiz' | 'input' | 'hybrid'

interface ModeSelectorProps {
  onModeSelect: (mode: ReviewMode) => void
}

interface ModeOption {
  id: ReviewMode
  icon: React.ElementType
  title: string
  description: string
  features: string[]
  color: string
}

const modes: ModeOption[] = [
  {
    id: 'flashcard',
    icon: CreditCard,
    title: 'Flashcard',
    description: 'Classic flip card format for efficient memorization',
    features: ['Front shows kanji/grammar', 'Back reveals answer', 'Mark Correct or Remove'],
    color: 'text-blue-500'
  },
  {
    id: 'quiz',
    icon: CircleHelp,
    title: 'Quiz',
    description: 'Multiple choice with instant feedback',
    features: ['4 answer options', 'Wrong? Try again', 'Unlimited attempts'],
    color: 'text-purple-500'
  },
  {
    id: 'input',
    icon: Keyboard,
    title: 'Input',
    description: 'Type the answer for active recall',
    features: ['Type Japanese answer', 'Accepts kanji OR reading', 'Hint after 3 fails'],
    color: 'text-green-500'
  },
  {
    id: 'hybrid',
    icon: Shuffle,
    title: 'Hybrid',
    description: 'Choose your mode per item',
    features: ['Switch modes during session', 'Maximum flexibility', 'Adaptive learning'],
    color: 'text-orange-500'
  }
]

export function ModeSelector({onModeSelect}: ModeSelectorProps) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Brain className="size-8 text-[#c74a4a]" />
          <h1 className="text-4xl font-bold">Choose Your Review Mode</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Select a study mode that fits your learning style
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {modes.map((mode) => {
          const Icon = mode.icon
          return (
            <Card
              key={mode.id}
              className="cursor-pointer border-2 transition-all hover:border-[#c74a4a] hover:shadow-lg"
              onClick={() => onModeSelect(mode.id)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg bg-muted p-3 ${mode.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="mb-1 text-xl">{mode.title}</CardTitle>
                    <CardDescription className="text-base">
                      {mode.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Zap className={`size-4 ${mode.color}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="default"
                  className="mt-4 w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onModeSelect(mode.id)
                  }}
                >
                  <Sparkles className="mr-2 size-4" />
                  Start {mode.title} Mode
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg bg-muted/50 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Target className="size-5 text-[#c74a4a]" />
          Study Tips
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>Flashcard</strong> - Best for quick reviews and building initial memory</li>
          <li>• <strong>Quiz</strong> - Great for testing recognition and confidence</li>
          <li>• <strong>Input</strong> - Ideal for strengthening active recall and spelling</li>
          <li>• <strong>Hybrid</strong> - Perfect for mixing different learning approaches</li>
        </ul>
      </div>
    </div>
  )
}

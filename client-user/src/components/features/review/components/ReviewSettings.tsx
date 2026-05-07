'use client'

import {Settings} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {type ReviewMode} from './ModeSelector'

interface ReviewSettingsProps {
  currentMode: ReviewMode
  onModeChange: (mode: ReviewMode) => void
}

const modeLabels: Record<ReviewMode, string> = {
  flashcard: 'Flashcard',
  quiz: 'Quiz',
  input: 'Input',
  hybrid: 'Hybrid',
}

export function ReviewSettings({currentMode, onModeChange}: ReviewSettingsProps) {
  return (
    <div className="absolute left-4 top-4 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm"
            aria-label="Review settings"
          >
            <Settings className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Review Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(modeLabels) as ReviewMode[]).map((mode) => (
            <DropdownMenuItem
              key={mode}
              onClick={() => onModeChange(mode)}
              className={mode === currentMode ? 'bg-accent' : ''}
            >
              <span className="flex-1">{modeLabels[mode]}</span>
              {mode === currentMode && (
                <span className="text-xs text-muted-foreground">(current)</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

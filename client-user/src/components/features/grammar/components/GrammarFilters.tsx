'use client'

import { Button } from "@/components/ui/button"

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
const LESSONS = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const

interface GrammarFiltersProps {
  selectedLevel: string
  selectedLesson: string
  onLevelChange: (level: string) => void
  onLessonChange: (lesson: string) => void
}

export function GrammarFilters({
  selectedLevel,
  selectedLesson,
  onLevelChange,
  onLessonChange,
}: GrammarFiltersProps) {
  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-10 gap-2'>
        {LEVELS.map(level => (
          <Button
            key={level}
            onClick={() => onLevelChange(level)}
            className={`col-span-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedLevel === level
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {level}
          </Button>
        ))}
      </div>

      <div className='grid grid-cols-11 gap-2'>
        {LESSONS.map(lesson => (
          <Button
            key={lesson}
            onClick={() => onLessonChange(lesson === 'All' ? '' : lesson)}
            className={`col-span-1 px-3 py-1 rounded-md text-sm transition-colors ${
              (lesson === 'All' && selectedLesson === '') ||
              selectedLesson === lesson
                ? 'bg-secondary text-secondary-foreground font-medium'
                : 'bg-transparent hover:bg-muted text-muted-foreground'
            }`}
          >
            {lesson}
          </Button>
        ))}
      </div>
    </div>
  )
}

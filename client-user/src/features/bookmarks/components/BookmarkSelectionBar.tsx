'use client'

import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BookmarkSelectionBarProps {
  selectedVocabIds: number[]
  selectedGrammarIds: number[]
  totalSelected: number
  onStopSelecting: () => void
  onRemoveBookmarks: () => void
}

export function BookmarkSelectionBar({
  selectedVocabIds,
  selectedGrammarIds,
  totalSelected,
  onStopSelecting,
  onRemoveBookmarks,
}: BookmarkSelectionBarProps) {
  const count = totalSelected

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Button variant="outline" onClick={onStopSelecting}>
          ■ Stop Selecting
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            Learn
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled>
                <span className="mr-2">⋮</span>
                Reviews
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Add to Reviews</DropdownMenuItem>
              <DropdownMenuItem disabled>Mark as Mastered</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onRemoveBookmarks}>Remove Bookmarks</Button>
        </div>
      </div>
    </div>
  )
}

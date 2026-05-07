'use client'

import {
  BookmarkPlus,
  CheckCheck,
  Trash2,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useAddToQueue, useMarkAsMastered, useMasteredIds} from '@/components/features/review/hook/useReviewQueue'

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
  // Get mastered IDs for both words and grammar
  const {data: masteredWordsData} = useMasteredIds('word')
  const masteredWordIds = new Set(masteredWordsData?.ids ?? [])

  const {data: masteredGrammarData} = useMasteredIds('grammar')
  const masteredGrammarIds = new Set(masteredGrammarData?.ids ?? [])

  const {addWord, addGrammar, isAddingWord, isAddingGrammar} = useAddToQueue()
  const {markWord, markGrammar, isMarkingWord, isMarkingGrammar} = useMarkAsMastered()

  const handleAddToReviews = () => {
    if (selectedVocabIds.length > 0) {
      addWord(selectedVocabIds)
    }
    if (selectedGrammarIds.length > 0) {
      addGrammar(selectedGrammarIds)
    }
    onStopSelecting()
  }

  const handleMarkMastered = () => {
    if (selectedVocabIds.length > 0) {
      markWord(selectedVocabIds)
    }
    if (selectedGrammarIds.length > 0) {
      markGrammar(selectedGrammarIds)
    }
    onStopSelecting()
  }

  // Check if any selected item is mastered
  const hasMasteredItems =
    selectedVocabIds.some(id => masteredWordIds.has(id)) ||
    selectedGrammarIds.some(id => masteredGrammarIds.has(id))

  const isProcessing = isAddingWord || isAddingGrammar || isMarkingWord || isMarkingGrammar

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
              <Button variant="outline" disabled={isProcessing}>
                <span className="mr-2">⋮</span>
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleAddToReviews}
                disabled={isProcessing || hasMasteredItems}
              >
                <BookmarkPlus size={15} className="mr-2" />
                Add to Reviews
                {hasMasteredItems && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    (mastered items selected)
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleMarkMastered}
                disabled={isProcessing || hasMasteredItems}
              >
                <CheckCheck size={15} className="mr-2" />
                Mark as Mastered
                {hasMasteredItems && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    (already mastered)
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="destructive" onClick={onRemoveBookmarks} disabled={isProcessing}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Bookmarks
          </Button>
        </div>
      </div>
    </div>
  )
}

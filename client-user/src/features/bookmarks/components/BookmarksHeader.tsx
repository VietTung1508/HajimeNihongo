'use client'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {WordSearchBar} from '@/components/features/words/components/WordSearchBar'
import type {SortOption} from '../types'

interface BookmarksHeaderProps {
  searchQuery: string
  sort: SortOption
  selectedCount: number
  isSelectionMode: boolean
  onSearchChange: (query: string) => void
  onSortChange: (sort: SortOption) => void
  onSelectItemsClick: () => void
}

const SORT_OPTIONS: {value: SortOption; label: string}[] = [
  {value: 'newest', label: 'Newest'},
  {value: 'oldest', label: 'Oldest'},
  {value: 'level', label: 'Level'},
]

export function BookmarksHeader({
  searchQuery,
  sort,
  selectedCount,
  isSelectionMode,
  onSearchChange,
  onSortChange,
  onSelectItemsClick,
}: BookmarksHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-[0.65] relative">
          <WordSearchBar
            onSearch={onSearchChange}
            placeholder="Search bookmarks..."
            defaultValue={searchQuery}
          />
        </div>

        <Button
          variant={isSelectionMode ? 'secondary' : 'outline'}
          onClick={onSelectItemsClick}
        >
          Select Items
          {selectedCount > 0 && (
            <Badge variant="default" className="ml-2">
              {selectedCount}
            </Badge>
          )}
        </Button>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

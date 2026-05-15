'use client'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {Loader2} from 'lucide-react'
import {Switch} from '@/components/ui/switch'
import {WordSearchBar} from './WordSearchBar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SORT_OPTIONS = [
  {value: 'relevance', label: 'Relevance'},
  {value: 'highest_jlpt', label: 'Highest JLPT'},
  {value: 'lowest_jlpt', label: 'Lowest JLPT'},
]

const JLPT_OPTIONS = [
  {value: 'all', label: 'All levels'},
  {value: '5', label: 'N5'},
  {value: '4', label: 'N4'},
  {value: '3', label: 'N3'},
  {value: '2', label: 'N2'},
  {value: '1', label: 'N1'},
]

interface WordListHeaderProps {
  searchQuery: string
  sort: string
  jlptFilter: string
  unlockedLevels?: string[]
  commonOnly: boolean
  selectedCount: number
  isSelectionMode: boolean
  isSearching?: boolean
  onSearch: (q: string) => void
  onSortChange: (sort: string) => void
  onJlptFilterChange: (level: string) => void
  onCommonOnlyChange: (checked: boolean) => void
  onSelectItemsClick: () => void
}

export function WordListHeader({
  searchQuery,
  sort,
  jlptFilter,
  unlockedLevels,
  commonOnly,
  selectedCount,
  isSelectionMode,
  isSearching = false,
  onSearch,
  onSortChange,
  onJlptFilterChange,
  onCommonOnlyChange,
  onSelectItemsClick,
}: WordListHeaderProps) {
  const unlockedLevelValues = new Set(
    unlockedLevels?.map(level => level.replace('N', '')) ?? [],
  )
  const jlptOptions = JLPT_OPTIONS.filter(
    opt => opt.value === 'all' || unlockedLevelValues.has(opt.value),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <WordSearchBar
            onSearch={onSearch}
            placeholder="Search words..."
            defaultValue={searchQuery}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
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
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={jlptFilter} onValueChange={onJlptFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="JLPT" />
          </SelectTrigger>
          <SelectContent>
            {jlptOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

        <div className="flex items-center gap-2">
          <Switch
            id="common-only"
            checked={commonOnly}
            onCheckedChange={onCommonOnlyChange}
          />
          <Label htmlFor="common-only" className="text-sm font-medium cursor-pointer">
            Common words only
          </Label>
      </div>
    </div>
  )
}

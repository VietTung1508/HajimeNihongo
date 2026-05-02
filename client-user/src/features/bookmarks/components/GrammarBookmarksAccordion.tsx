'use client'

import {useState, useEffect} from 'react'
import {ChevronDown} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Pagination} from '@/components/shared/Pagination'
import {GrammarCard} from '@/components/features/grammar/components/GrammarCard'
import {useBookmark} from '../hook/useBookmark'
import {useDebounce} from '../hook/useDebounce'
import type {GrammarBookmarkDTO} from '../types'

interface GrammarBookmarksAccordionProps {
  page: number
  searchQuery: string
  sort: string
  isSelectionMode: boolean
  selectedIds: Set<number>
  onPageChange: (page: number) => void
  onToggleSelect: (id: number) => void
}

const LIMIT = 12
const STORAGE_KEY = 'hajime-nihongo:bookmarks-accordion-grammar'

export function GrammarBookmarksAccordion({
  page,
  searchQuery,
  sort,
  isSelectionMode,
  selectedIds,
  onPageChange,
  onToggleSelect,
}: GrammarBookmarksAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const {useGetBookmarks, toggleBookmark} = useBookmark({type: 'grammar'})
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setIsExpanded(stored === 'expanded')
    }
  }, [])

  const handleToggleExpand = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem(STORAGE_KEY, newState ? 'expanded' : 'collapsed')
  }

  const {data, isLoading, isError} = useGetBookmarks(
    page,
    LIMIT,
    debouncedSearch,
    sort,
  )

  const bookmarks = data?.data ?? []
  const total = data?.total ?? 0

  const handleToggleBookmark = (grammarId: number) => {
    toggleBookmark.mutate({
      id: grammarId,
      action: 'remove',
    })
  }

  return (
    <Card>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-4 h-auto"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${!isExpanded ? '-rotate-90' : ''}`}
          />
          <span className="font-semibold">Grammar Bookmarks</span>
          <Badge variant="secondary">{total}</Badge>
        </div>
      </Button>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({length: LIMIT}).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">
                An error occurred while loading bookmarks.
              </p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">
                {debouncedSearch
                  ? 'No grammar bookmarks match your search'
                  : 'No grammar bookmarks'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {bookmarks.map((grammar: GrammarBookmarkDTO, index: number) => (
                  <GrammarCard
                    key={grammar.id}
                    grammar={grammar}
                    index={index}
                    total={bookmarks.length}
                    isBookmarked={true}
                    onToggleBookmark={() => handleToggleBookmark(grammar.id)}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.has(grammar.id)}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </div>

              <Pagination page={page} total={total} limit={LIMIT} onPageChange={onPageChange} />
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

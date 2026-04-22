'use client'

import {useState, useEffect, useRef} from 'react'
import {WordCard} from './components/WordCard'
import {WordCardSkeleton} from './components/WordCardSkeleton'
import {WordListHeader} from './components/WordListHeader'
import {WordPagination} from './components/WordPagination'
import {WordSelectionBar} from './components/WordSelectionBar'
import {EmptyState} from './components/EmptyState'
import {useWordList} from './hook/useWordList'

const LIMIT = 12

export function WordsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('relevance')
  const [jlptFilter, setJlptFilter] = useState('all')
  const [commonOnly, setCommonOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const {data, isLoading, isError, isSearching} = useWordList(
    searchQuery,
    sort,
    page,
    commonOnly,
    LIMIT,
  )

  const words = data?.data ?? []
  const total = data?.total ?? 0

  useEffect(() => {
    setPage(1)
  }, [searchQuery, sort, commonOnly])

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectItemsClick = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false)
      setSelectedIds(new Set())
    } else {
      setIsSelectionMode(true)
    }
  }

  const handleStopSelecting = () => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleClearQuery = () => {
    setSearchQuery('')
    setJlptFilter('all')
    setCommonOnly(false)
    setPage(1)
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <WordListHeader
            searchQuery={searchQuery}
            sort={sort}
            jlptFilter={jlptFilter}
            commonOnly={commonOnly}
            selectedCount={selectedIds.size}
            isSelectionMode={isSelectionMode}
            isSearching={isSearching}
            onSearch={setSearchQuery}
            onSortChange={setSort}
            onJlptFilterChange={setJlptFilter}
            onCommonOnlyChange={setCommonOnly}
            onSelectItemsClick={handleSelectItemsClick}
          />
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-6'>
        {isLoading ? (
          <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({length: LIMIT}).map((_, i) => (
              <WordCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className='flex items-center justify-center py-16'>
            <p className='text-muted-foreground'>
              An error occurred while loading words.
            </p>
          </div>
        ) : words.length === 0 ? (
          <EmptyState
            hasQuery={searchQuery.length > 0}
            onClearQuery={handleClearQuery}
          />
        ) : (
          <>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
              {words.map((word) => (
                <WordCard
                  key={word.id}
                  word={word}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.has(word.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>

            <WordPagination
              page={page}
              total={total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Selection bar */}
      {isSelectionMode && selectedIds.size > 0 && (
        <WordSelectionBar
          selectedIds={Array.from(selectedIds)}
          onStopSelecting={handleStopSelecting}
        />
      )}
    </div>
  )
}

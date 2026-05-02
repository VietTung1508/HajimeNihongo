'use client'

import {useState, useEffect, useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {BookmarksHeader} from './components/BookmarksHeader'
import {VocabBookmarksAccordion} from './components/VocabBookmarksAccordion'
import {GrammarBookmarksAccordion} from './components/GrammarBookmarksAccordion'
import {BookmarkSelectionBar} from './components/BookmarkSelectionBar'
import {useBookmark} from './hook/useBookmark'
import type {BookmarksFilters} from './types'

export function BookmarksList() {
  const router = useRouter()
  const [filters, setFilters] = useState<BookmarksFilters>({
    searchQuery: '',
    sort: 'newest',
    vocabPage: 1,
    grammarPage: 1,
    isSelectionMode: false,
    selectedVocabIds: new Set<number>(),
    selectedGrammarIds: new Set<number>(),
  })

  const totalSelected =
    filters.selectedVocabIds.size + filters.selectedGrammarIds.size
  const {bulkRemoveBookmarks: bulkRemoveWordBookmarks} = useBookmark({
    type: 'word',
  })
  const {bulkRemoveBookmarks: bulkRemoveGrammarBookmarks} = useBookmark({
    type: 'grammar',
  })

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.searchQuery) params.set('search', filters.searchQuery)
    if (filters.sort !== 'newest') params.set('sort', filters.sort)

    const newUrl = params.toString() ? `/bookmarks?${params}` : '/bookmarks'
    router.replace(newUrl, {scroll: false})
  }, [filters.searchQuery, filters.sort, router])

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      vocabPage: 1,
      grammarPage: 1,
    }))
  }, [filters.searchQuery, filters.sort])

  const handleToggleVocabSelect = useCallback((id: number) => {
    setFilters((prev) => {
      const next = new Set(prev.selectedVocabIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return {...prev, selectedVocabIds: next}
    })
  }, [])

  const handleToggleGrammarSelect = useCallback((id: number) => {
    setFilters((prev) => {
      const next = new Set(prev.selectedGrammarIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return {...prev, selectedGrammarIds: next}
    })
  }, [])

  const handleSelectItemsClick = () => {
    if (filters.isSelectionMode) {
      setFilters((prev) => ({
        ...prev,
        isSelectionMode: false,
        selectedVocabIds: new Set(),
        selectedGrammarIds: new Set(),
      }))
    } else {
      setFilters((prev) => ({...prev, isSelectionMode: true}))
    }
  }

  const handleStopSelecting = () => {
    setFilters((prev) => ({
      ...prev,
      isSelectionMode: false,
      selectedVocabIds: new Set(),
      selectedGrammarIds: new Set(),
    }))
  }

  const handleRemoveBookmarks = async () => {
    const vocabIds = Array.from(filters.selectedVocabIds)
    const grammarIds = Array.from(filters.selectedGrammarIds)

    try {
      if (vocabIds.length > 0) {
        await bulkRemoveWordBookmarks.mutateAsync(vocabIds)
      }
      if (grammarIds.length > 0) {
        await bulkRemoveGrammarBookmarks.mutateAsync(grammarIds)
      }
      handleStopSelecting()
    } catch (error) {
      console.error('Failed to remove bookmarks:', error)
    }
  }

  const showSelectionBar = filters.isSelectionMode && totalSelected > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <BookmarksHeader
            searchQuery={filters.searchQuery}
            sort={filters.sort}
            selectedCount={totalSelected}
            isSelectionMode={filters.isSelectionMode}
            onSearchChange={(q) => setFilters((prev) => ({...prev, searchQuery: q}))}
            onSortChange={(s) => setFilters((prev) => ({...prev, sort: s}))}
            onSelectItemsClick={handleSelectItemsClick}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <VocabBookmarksAccordion
          page={filters.vocabPage}
          searchQuery={filters.searchQuery}
          sort={filters.sort}
          isSelectionMode={filters.isSelectionMode}
          selectedIds={filters.selectedVocabIds}
          onPageChange={(p) => setFilters((prev) => ({...prev, vocabPage: p}))}
          onToggleSelect={handleToggleVocabSelect}
        />

        <GrammarBookmarksAccordion
          page={filters.grammarPage}
          searchQuery={filters.searchQuery}
          sort={filters.sort}
          isSelectionMode={filters.isSelectionMode}
          selectedIds={filters.selectedGrammarIds}
          onPageChange={(p) =>
            setFilters((prev) => ({...prev, grammarPage: p}))
          }
          onToggleSelect={handleToggleGrammarSelect}
        />
      </div>

      {showSelectionBar && (
        <BookmarkSelectionBar
          selectedVocabIds={Array.from(filters.selectedVocabIds)}
          selectedGrammarIds={Array.from(filters.selectedGrammarIds)}
          totalSelected={totalSelected}
          onStopSelecting={handleStopSelecting}
          onRemoveBookmarks={handleRemoveBookmarks}
        />
      )}
    </div>
  )
}

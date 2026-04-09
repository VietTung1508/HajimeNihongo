'use client'

import {useState, useCallback} from 'react'
import {useSearchParams, useRouter} from 'next/navigation'
import {toast} from 'sonner'
import {useGrammarList} from './hook/useGrammarList'
import {useGrammarSearch} from './hook/useGrammarSearch'
import {GrammarCard} from './components/GrammarCard'
import {GrammarCardSkeleton} from './components/GrammarCardSkeleton'
import {GrammarFilters} from './components/GrammarFilters'
import {GrammarSearchBar} from './components/GrammarSearchBar'
import {LessonBanner} from './components/LessonBanner'
import {GrammarItem} from './types'
import Container from '@/components/layout/Container'

export function GrammarList() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const levelParam = searchParams.get('level') ?? 'N5'
  const lessonParam = searchParams.get('lesson') ?? ''

  const [selectedLevel, setSelectedLevel] = useState(levelParam)
  const [selectedLesson, setSelectedLesson] = useState(lessonParam)
  const [searchQuery, setSearchQuery] = useState('')

  const listQuery = useGrammarList(selectedLevel, lessonParam)
  const searchQuery_ = useGrammarSearch(searchQuery)

  const updateUrl = useCallback(
    (level: string, lesson: string) => {
      const params = new URLSearchParams()
      params.set('level', level)
      if (lesson) params.set('lesson', lesson)
      router.push(`/grammar?${params.toString()}`, {scroll: false})
    },
    [router],
  )

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level)
    setSelectedLesson('')
    setSearchQuery('')
    updateUrl(level, '')
  }

  const handleLessonChange = (lesson: string) => {
    setSelectedLesson(lesson)
    updateUrl(selectedLevel, lesson)
  }

  const handleSearch = (q: string) => {
    setSearchQuery(q)
  }

  const isSearchMode = searchQuery.trim().length > 0
  const data = isSearchMode
    ? searchQuery_.data?.data ?? []
    : listQuery.data?.data ?? []
  const isLoading = isSearchMode ? searchQuery_.isLoading : listQuery.isLoading
  const isError = isSearchMode ? searchQuery_.isError : listQuery.isError
  const isAllLesson = selectedLesson === ''
  const lessonTitle = data[0]?.lessonTitle

  if (isError) {
    toast.error('Failed to load grammar points')
  }

  return (
    <Container>
      <div className='py-6 space-y-6'>
        <GrammarSearchBar onSearch={handleSearch} />

        {!isSearchMode && (
          <GrammarFilters
            selectedLevel={selectedLevel}
            selectedLesson={selectedLesson}
            onLevelChange={handleLevelChange}
            onLessonChange={handleLessonChange}
          />
        )}

        {!isAllLesson && !isSearchMode && (
          <LessonBanner lessonNumber={selectedLesson} lessonTitle={lessonTitle} />
        )}

        {isSearchMode && searchQuery && (
          <p className='text-sm text-muted-foreground'>
            Search results for &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({length: 6}).map((_, i) => (
              <GrammarCardSkeleton key={i} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className='flex items-center justify-center h-48'>
            <p className='text-muted-foreground'>
              No grammar points found. Try different filters or search terms.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {data.map((grammar: GrammarItem , idx) => (
              <GrammarCard key={grammar.id} grammar={grammar} index={idx} total={listQuery?.data?.total ?? 0}/>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

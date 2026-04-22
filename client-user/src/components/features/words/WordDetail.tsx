'use client'

import {useEffect} from 'react'
import {useWordDetail} from './hook/useWordDetail'
import {WordDetailHeader} from './components/WordDetailHeader'
import {WordDetailContent} from './components/WordDetailContent'
import {Loader2} from 'lucide-react'
import {useParams} from 'next/navigation'
import {Separator} from '@radix-ui/react-dropdown-menu'

export function WordDetail() {
  const params = useParams()

  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const {data: word, isLoading, error} = useWordDetail(id ?? '')

  useEffect(() => {
    if (error) {
      console.error('Failed to load word:', error)
    }
  }, [error])

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    )
  }

  if (!word) {
    return (
      <div className='text-center py-20'>
        <p className='text-muted-foreground'>Word not found</p>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <WordDetailHeader word={word} />
      <WordDetailContent word={word} />
    </div>
  )
}

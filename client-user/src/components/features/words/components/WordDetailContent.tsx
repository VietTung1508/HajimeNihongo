'use client'

import {useState, useCallback, useRef, useEffect} from 'react'
import {Eye, EyeOff} from 'lucide-react'
import {WordDetailDTO} from '../types'
import {ActionButtons} from './ActionButtons'
import {DictionaryDefinition} from './DictionaryDefinition'
import {ExampleCard} from '@/components/shared/ExampleCard'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'

interface WordDetailContentProps {
  word: WordDetailDTO
}

type BlurMode = 'none' | 'sentence' | 'translation'

export function WordDetailContent({word}: WordDetailContentProps) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(
    null,
  )
  const stopFunctionRef = useRef<(() => void) | null>(null)
  const [blurMode, setBlurMode] = useState<BlurMode>('none')

  useEffect(() => {
    return () => {
      if (stopFunctionRef.current) {
        stopFunctionRef.current()
      }
    }
  }, [])

  const handlePlayStart = useCallback(
    (exampleId: number, stopFn: () => void) => {
      if (currentlyPlayingId !== null && currentlyPlayingId !== exampleId) {
        if (stopFunctionRef.current) {
          stopFunctionRef.current()
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      }
      stopFunctionRef.current = stopFn
      setCurrentlyPlayingId(exampleId)
    },
    [currentlyPlayingId],
  )

  const handlePlayEnd = useCallback(() => {
    setCurrentlyPlayingId(null)
    stopFunctionRef.current = null
  }, [])

  const toggleSentenceBlur = useCallback(() => {
    setBlurMode((prev) => (prev === 'sentence' ? 'none' : 'sentence'))
  }, [])

  const toggleTranslationBlur = useCallback(() => {
    setBlurMode((prev) => (prev === 'translation' ? 'none' : 'translation'))
  }, [])

  return (
    <div className='flex flex-col lg:flex-row gap-8 mt-8'>
      {/* Left Content (75%) */}
      <div className='flex-1 lg:w-3/4 space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Dictionary Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            <DictionaryDefinition word={word} />
          </CardContent>
        </Card>

        {/* Examples Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Examples</CardTitle>
              <div className='flex gap-2'>
                <Button
                  variant={blurMode === 'sentence' ? 'default' : 'outline'}
                  size='sm'
                  onClick={toggleSentenceBlur}
                  className='gap-2'
                >
                  {blurMode === 'sentence' ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                  Sentences
                </Button>
                <Button
                  variant={blurMode === 'translation' ? 'default' : 'outline'}
                  size='sm'
                  onClick={toggleTranslationBlur}
                  className='gap-2'
                >
                  {blurMode === 'translation' ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                  Translation
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {word.examples.length > 0 ? (
              word.examples.map((example) => (
                <ExampleCard
                  key={example.id}
                  example={example}
                  highlightKanji={word.kanji}
                  highlightReading={word.reading}
                  currentlyPlayingId={currentlyPlayingId}
                  onPlayStart={handlePlayStart}
                  onPlayEnd={handlePlayEnd}
                  blurSentence={blurMode === 'sentence'}
                  blurTranslation={blurMode === 'translation'}
                />
              ))
            ) : (
              <p className='text-muted-foreground'>No examples available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='lg:w-1/4'>
        <ActionButtons />
      </div>
    </div>
  )
}

'use client'

import {useState, useCallback, useRef, useEffect} from 'react'
import {toast} from 'sonner'
import {useGrammarDetail} from './hook/useGrammarDetail'
import {GrammarDetailHeader} from './components/GrammarDetailHeader'
import {GrammarSidebar} from './components/GrammarSidebar'
import {ExampleCard, Example} from '@/components/shared/ExampleCard'
import {GrammarCardSkeleton} from './components/GrammarCardSkeleton'
import Container from '@/components/layout/Container'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Eye, EyeOff} from 'lucide-react'

interface GrammarDetailProps {
  id: number
}

type BlurMode = 'none' | 'sentence' | 'translation'

export function GrammarDetail({id}: GrammarDetailProps) {
  const {data, isLoading, isError} = useGrammarDetail(id)
  const [blurMode, setBlurMode] = useState<BlurMode>('none')

  // Audio playback state
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(
    null,
  )
  const stopFunctionRef = useRef<(() => void) | null>(null)

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

  const toSharedExample = (grammarExample: {
    id: number
    sentence: string
    translation: string
    audioUrl: string | null
  }): Example => ({
    id: grammarExample.id,
    sentence: grammarExample.sentence,
    translation: grammarExample.translation,
    audioUrl: grammarExample.audioUrl ?? undefined,
  })

  const toggleSentenceBlur = useCallback(() => {
    setBlurMode((prev) => (prev === 'sentence' ? 'none' : 'sentence'))
  }, [])

  const toggleTranslationBlur = useCallback(() => {
    setBlurMode((prev) => (prev === 'translation' ? 'none' : 'translation'))
  }, [])

  if (isLoading) {
    return (
      <Container>
        <div className='py-6 space-y-4'>
          <GrammarCardSkeleton />
          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-8 space-y-4'>
              {Array.from({length: 4}).map((_, i) => (
                <GrammarCardSkeleton key={i} />
              ))}
            </div>
            <div className='col-span-4'>
              <GrammarCardSkeleton />
            </div>
          </div>
        </div>
      </Container>
    )
  }

  if (isError || !data) {
    toast.error('Failed to load grammar point')
    return (
      <Container>
        <div className='py-6 text-center text-muted-foreground'>
          Grammar point not found.
        </div>
      </Container>
    )
  }

  const {
    structure,
    structureDisplay,
    partOfSpeech,
    register,
    about,
    exampleJp,
    exampleEn,
    examples,
    synonyms,
    antonyms,
    grammarPoint,
  } = data

  return (
    <Container>
      <div className='py-6 space-y-6'>
        <GrammarDetailHeader grammar={data} />

        <div className='grid grid-cols-12 gap-6'>
          {/* LEFT COLUMN: 8/12 */}
          <div className='col-span-12 lg:col-span-8 space-y-4'>
            {/* Structure */}
            {(structureDisplay || structure) && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className='bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto'>
                    {structureDisplay ?? structure}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            {(partOfSpeech || register) && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {partOfSpeech && (
                      <div className='flex gap-4'>
                        <span className='text-sm text-muted-foreground w-32'>
                          Part of Speech
                        </span>
                        <span className='text-sm'>{partOfSpeech}</span>
                      </div>
                    )}
                    {register && (
                      <div className='flex gap-4'>
                        <span className='text-sm text-muted-foreground w-32'>
                          Register
                        </span>
                        <span className='text-sm'>{register}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About */}
            {about && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>{`About ${grammarPoint}`}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-sm leading-relaxed text-muted-foreground'>
                    {about}
                  </p>

                  {/* Legacy example from Grammar entity */}
                  {exampleJp && exampleEn && (
                    <div className='rounded-lg border-l-4 border-primary pl-4 py-2 bg-muted/50'>
                      <p className='text-base font-medium mb-1'>{exampleJp}</p>
                      <p className='text-sm text-muted-foreground'>
                        {exampleEn}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Grammar Examples */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>Examples</CardTitle>
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
                      variant={
                        blurMode === 'translation' ? 'default' : 'outline'
                      }
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
                {examples.length > 0 ? (
                  <div className='space-y-3'>
                    {examples.map((example) => (
                      <ExampleCard
                        key={example.id}
                        example={toSharedExample(example)}
                        currentlyPlayingId={currentlyPlayingId}
                        onPlayStart={handlePlayStart}
                        onPlayEnd={handlePlayEnd}
                        highlightKanji={grammarPoint}
                        blurSentence={blurMode === 'sentence'}
                        blurTranslation={blurMode === 'translation'}
                      />
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No examples yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Synonyms */}
            {synonyms && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Synonyms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2 flex-wrap'>
                    {synonyms.split(',').map((s, i) => (
                      <Badge key={i} variant='outline'>
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Antonyms */}
            {antonyms && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Antonyms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2 flex-wrap'>
                    {antonyms.split(',').map((a, i) => (
                      <Badge key={i} variant='outline'>
                        {a.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: 4/12 */}
          <div className='col-span-12 lg:col-span-4'>
            <GrammarSidebar grammar={data} />
          </div>
        </div>
      </div>
    </Container>
  )
}

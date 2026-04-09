'use client'

import {toast} from 'sonner'
import {useGrammarDetail} from './hook/useGrammarDetail'
import {GrammarDetailHeader} from './components/GrammarDetailHeader'
import {GrammarSection} from './components/GrammarSection'
import {GrammarSidebar} from './components/GrammarSidebar'
import {ExampleCard} from './components/ExampleCard'
import {GrammarCardSkeleton} from './components/GrammarCardSkeleton'
import Container from '@/components/layout/Container'
import {Badge} from '@/components/ui/badge'

interface GrammarDetailProps {
  id: number
}

export function GrammarDetail({id}: GrammarDetailProps) {
  const {data, isLoading, isError} = useGrammarDetail(id)

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
      <div className='py-6'>
        <GrammarDetailHeader grammar={data} />

        <div className='grid grid-cols-12 gap-6'>
          {/* LEFT COLUMN: 8/12 */}
          <div className='col-span-12 lg:col-span-8 space-y-8'>
            {/* Structure */}
            {(structureDisplay || structure) && (
              <GrammarSection title='Structure'>
                <pre className='bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto'>
                  {structureDisplay ?? structure}
                </pre>
              </GrammarSection>
            )}

            {/* Details */}
            {(partOfSpeech || register) && (
              <GrammarSection title='Details'>
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
              </GrammarSection>
            )}

            {about && (
              <GrammarSection title={`About ${grammarPoint}`}>
                <p className='text-sm leading-relaxed text-muted-foreground'>
                  {about}
                </p>

                {/* Legacy example from Grammar entity */}
                {exampleJp && exampleEn && (
                  <div className='mt-4 rounded-lg border-l-4 border-primary pl-4 py-2 bg-muted/50'>
                    <p className='text-base font-medium mb-1'>{exampleJp}</p>
                    <p className='text-sm text-muted-foreground'>{exampleEn}</p>
                  </div>
                )}
              </GrammarSection>
            )}

            {/* Grammar Examples */}
            <GrammarSection title='Examples'>
              {examples.length > 0 ? (
                <div className='space-y-3'>
                  {examples.map((example) => (
                    <ExampleCard key={example.id} example={example} />
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No examples yet.
                </p>
              )}
            </GrammarSection>

            {/* Synonyms */}
            {synonyms && (
              <GrammarSection title='Synonyms'>
                <div className='flex gap-2 flex-wrap'>
                  {synonyms.split(',').map((s, i) => (
                    <Badge key={i} variant='outline'>
                      {s.trim()}
                    </Badge>
                  ))}
                </div>
              </GrammarSection>
            )}

            {/* Antonyms */}
            {antonyms && (
              <GrammarSection title='Antonyms'>
                <div className='flex gap-2 flex-wrap'>
                  {antonyms.split(',').map((a, i) => (
                    <Badge key={i} variant='outline'>
                      {a.trim()}
                    </Badge>
                  ))}
                </div>
              </GrammarSection>
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

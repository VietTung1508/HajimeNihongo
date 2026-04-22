'use client'

import {useState, useRef} from 'react'
import {Play, Loader2, Volume2, Copy, Check} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'

export interface Example {
  id: number
  sentence: string
  translation: string
  audioUrl?: string
}

interface ExampleCardProps {
  example: Example
  highlightKanji?: string | null
  highlightReading?: string
  currentlyPlayingId: number | null
  onPlayStart: (exampleId: number, stopFn: () => void) => void
  onPlayEnd: () => void
  blurSentence?: boolean
  blurTranslation?: boolean
}

export function ExampleCard({
  example,
  highlightKanji,
  highlightReading,
  currentlyPlayingId,
  onPlayStart,
  onPlayEnd,
  blurSentence = false,
  blurTranslation = false,
}: ExampleCardProps) {
  const isPlaying = currentlyPlayingId === example.id
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
    }
    onPlayEnd()
    setIsLoading(false)
  }

  const highlightWord = (sentence: string) => {
    const targets: string[] = []

    if (highlightKanji) {
      targets.push(highlightKanji)
    }
    if (highlightReading) {
      targets.push(highlightReading)
    }

    for (const target of targets) {
      const index = sentence.indexOf(target)
      if (index !== -1) {
        return (
          <>
            {sentence.slice(0, index)}
            <span className='text-red-500 font-bold'>{target}</span>
            {sentence.slice(index + target.length)}
          </>
        )
      }
    }

    return <>{sentence}</>
  }

  const handlePlay = async () => {
    if (isLoading || isPlaying) {
      stopAudio()
      return
    }

    setIsLoading(true)

    try {
      if (example.audioUrl) {
        const audio = new Audio(example.audioUrl)
        audioRef.current = audio

        audio.onended = () => {
          onPlayEnd()
          audioRef.current = null
        }

        audio.onerror = () => {
          playBrowserTTS()
        }

        audio.onloadeddata = () => {
          setIsLoading(false)
        }

        await audio.play()
        onPlayStart(example.id, stopAudio)
      } else {
        playBrowserTTS()
      }
    } catch (error) {
      console.error('Failed to play audio:', error)
      setIsLoading(false)
    }
  }

  const playBrowserTTS = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(example.sentence)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.9

      utterance.onend = () => {
        onPlayEnd()
        utteranceRef.current = null
      }

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e)
        onPlayEnd()
        setIsLoading(false)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      onPlayStart(example.id, stopAudio)
      setIsLoading(false)
    } else {
      console.warn('Speech synthesis not supported')
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(example.sentence)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Card className='mb-4'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handlePlay}
            disabled={
              isLoading ||
              (currentlyPlayingId !== null && currentlyPlayingId !== example.id)
            }
            className='flex-shrink-0'
          >
            {isLoading ? (
              <Loader2 className='w-5 h-5 animate-spin' />
            ) : isPlaying ? (
              <Volume2 className='w-5 h-5' />
            ) : (
              <Play className='w-5 h-5' />
            )}
          </Button>

          <div className='flex-1 text-center'>
            <p
              className={`text-lg mb-1 transition-all duration-300 ${
                blurSentence ? 'blur-sm select-none' : ''
              }`}
            >
              {highlightWord(example.sentence)}
            </p>
            <p
              className={`text-muted-foreground transition-all duration-300 ${
                blurTranslation ? 'blur-sm select-none' : ''
              }`}
            >
              {example.translation}
            </p>
          </div>

          <Button
            variant='ghost'
            size='icon'
            onClick={handleCopy}
            className='flex-shrink-0'
            title='Copy sentence'
          >
            {copied ? (
              <Check className='w-4 h-4 text-green-500' />
            ) : (
              <Copy className='w-4 h-4' />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

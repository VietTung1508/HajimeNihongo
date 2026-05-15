'use client'

import {useState, useRef, useCallback, useEffect} from 'react'

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void
}

export const useVoiceInput = ({onTranscript}: UseVoiceInputOptions) => {
  const [supported, setSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Store callback in ref so the effect doesn't re-run when parent re-renders
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  useEffect(() => {
    const SpeechRecognitionAPI =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    setSupported(true)
    const recognition: SpeechRecognition = new SpeechRecognitionAPI()
    recognition.lang = 'ja-JP'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim()
      // Guard: only fire if transcript is non-empty
      if (transcript) {
        onTranscriptRef.current(transcript)
      }
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition

    // Cleanup: abort recognition if component unmounts mid-session
    return () => {
      recognition.abort()
    }
  }, []) // empty deps — callback accessed via ref, no recreation on re-render

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    setIsListening(true)
    recognitionRef.current.start()
  }, [isListening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return
    recognitionRef.current.stop()
  }, [isListening])

  return {supported, isListening, startListening, stopListening}
}

'use client'

import {useState, useCallback} from 'react'
import {Send} from 'lucide-react'
import {ChatModeEnum, SendMessagePayload} from '../types'
import {useVoiceInput} from '../hook/useVoiceInput'
import {VoiceMicButton} from './VoiceMicButton'

interface ChatInputBarProps {
  activeMode: ChatModeEnum
  isStreaming: boolean
  onSend: (payload: SendMessagePayload) => void
  initialValue?: string
}

export const ChatInputBar = ({activeMode, isStreaming, onSend, initialValue}: ChatInputBarProps) => {
  const [inputValue, setInputValue] = useState(initialValue ?? '')

  const handleSubmit = useCallback(
    (content: string, isVoice: boolean) => {
      const trimmed = content.trim()
      if (!trimmed || isStreaming) return
      onSend({content: trimmed, mode: activeMode, isVoice})
      setInputValue('')
    },
    [activeMode, isStreaming, onSend],
  )

  // Auto-send when voice transcript arrives
  const handleTranscript = useCallback(
    (text: string) => {
      setInputValue(text)
      handleSubmit(text, true)
    },
    [handleSubmit],
  )

  const {supported, isListening, startListening, stopListening} = useVoiceInput({
    onTranscript: handleTranscript,
  })

  return (
    <div className="bg-slate-900/80 border-t border-slate-800/60 px-4 py-3">
      <div className="flex gap-2 items-end bg-slate-800/60 rounded-xl px-3 py-2 ring-1 ring-slate-700/60 focus-within:ring-indigo-500/50 transition-shadow">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(inputValue, false)
            }
          }}
          placeholder="Type or speak… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 bg-transparent py-1.5 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none"
        />
        <div className="flex items-center gap-1.5 pb-0.5">
          <VoiceMicButton
            supported={supported}
            isListening={isListening}
            onMouseDown={startListening}
            onMouseUp={stopListening}
          />
          <button
            onClick={() => handleSubmit(inputValue, false)}
            disabled={!inputValue.trim() || isStreaming}
            className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

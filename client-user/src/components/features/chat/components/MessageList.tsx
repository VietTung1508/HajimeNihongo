'use client'

import {useEffect, useRef} from 'react'
import {ChatMessage} from '../types'
import {MessageBubble} from './MessageBubble'

interface MessageListProps {
  messages: ChatMessage[]
  hasMoreMessages: boolean
  onLoadOlder: () => void
  sessionId: string | null
  isStreaming: boolean
}

export const MessageList = ({
  messages,
  hasMoreMessages,
  onLoadOlder,
  sessionId,
  isStreaming,
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef<number>(0)
  const isPrependingRef = useRef(false)
  const wasStreamingRef = useRef(false)

  // Auto-scroll to bottom when sessionId changes (new session selected)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [sessionId])

  // Force scroll to bottom when streaming starts (user just sent a message)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (isStreaming && !wasStreamingRef.current) {
      el.scrollTop = el.scrollHeight
    }
    wasStreamingRef.current = isStreaming
  }, [isStreaming])

  // Auto-scroll to bottom when new messages appended (streaming chunks)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  // Preserve scroll position only when older messages are prepended
  useEffect(() => {
    const el = containerRef.current
    if (!el || !isPrependingRef.current) return
    isPrependingRef.current = false
    const diff = el.scrollHeight - prevScrollHeightRef.current
    if (diff > 0) {
      el.scrollTop += diff
    }
    prevScrollHeightRef.current = el.scrollHeight
  }, [messages.length])

  // Load older on scroll-up sentinel
  useEffect(() => {
    const sentinel = topSentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreMessages) {
          isPrependingRef.current = true
          prevScrollHeightRef.current = container.scrollHeight
          onLoadOlder()
        }
      },
      {root: container, threshold: 0.1},
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreMessages, onLoadOlder])

  if (!sessionId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-3xl">
          🤖
        </div>
        <div>
          <p className="text-slate-300 font-medium">Start a conversation</p>
          <p className="text-slate-500 text-sm mt-1">Select a chat or create a new one</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-3xl">
          💬
        </div>
        <div>
          <p className="text-slate-200 font-semibold text-lg">Let&apos;s get started!</p>
          <p className="text-slate-500 text-sm mt-1">What do you want to talk about?</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
      <div ref={topSentinelRef} className="h-1" />
      {hasMoreMessages && (
        <p className="text-xs text-slate-600 text-center">Scroll up for older messages</p>
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  )
}

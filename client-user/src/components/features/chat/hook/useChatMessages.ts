'use client'

import {useState, useCallback, useRef, useEffect} from 'react'
import {toast} from 'sonner'
import {chatApi} from '../services/api'
import {ChatMessage, SendMessagePayload} from '../types'

export const useChatMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [oldestCursor, setOldestCursor] = useState<string | undefined>()
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Reset all state when session changes; abort any in-flight stream
  useEffect(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsStreaming(false)
    setOldestCursor(undefined)
    setHasMoreMessages(false)

    if (!sessionId) return

    // Load initial messages for the new session
    setIsLoadingInitial(true)
    chatApi
      .getMessages(sessionId)
      .then((page) => {
        // API returns newest-first; reverse to render oldest-first
        setMessages([...page.messages].reverse())
        setOldestCursor(page.nextCursor ?? undefined)
        setHasMoreMessages(page.hasMore)
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setIsLoadingInitial(false))
  }, [sessionId])

  // Abort stream on component unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // Load older messages on scroll-up (prepend to list)
  const loadOlderMessages = useCallback(async () => {
    if (!sessionId || !oldestCursor || !hasMoreMessages) return
    try {
      const page = await chatApi.getMessages(sessionId, oldestCursor)
      const older = [...page.messages].reverse()
      setMessages((prev) => [...older, ...prev])
      setOldestCursor(page.nextCursor ?? undefined)
      setHasMoreMessages(page.hasMore)
    } catch {
      toast.error('Failed to load older messages')
    }
  }, [sessionId, oldestCursor, hasMoreMessages])

  const sendMessage = useCallback(
    async (payload: SendMessagePayload) => {
      if (!sessionId || isStreaming) return

      const tempUserId = crypto.randomUUID()
      const tempAssistantId = crypto.randomUUID()

      // Optimistically add user message
      const optimisticUser: ChatMessage = {
        id: tempUserId,
        role: 'user',
        content: payload.content,
        mode: payload.mode,
        isVoice: payload.isVoice,
        createdAt: new Date().toISOString(),
      }
      // Placeholder for streaming assistant response
      const optimisticAssistant: ChatMessage = {
        id: tempAssistantId,
        role: 'assistant',
        content: '',
        mode: payload.mode,
        isVoice: false,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, optimisticUser, optimisticAssistant])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      await chatApi.streamMessage(
        sessionId,
        payload,
        (chunk) => {
          // Append chunk to streaming placeholder in place
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId ? {...m, content: m.content + chunk} : m,
            ),
          )
        },
        async () => {
          // Stream done — fetch confirmed messages from server to replace temp IDs
          setIsStreaming(false)
          try {
            const page = await chatApi.getMessages(sessionId)
            setMessages([...page.messages].reverse())
            setOldestCursor(page.nextCursor ?? undefined)
            setHasMoreMessages(page.hasMore)
          } catch {
            // Keep optimistic messages if refresh fails
          }
        },
        (errMsg) => {
          setIsStreaming(false)
          toast.error(errMsg || 'AI response failed')
          // Remove optimistic messages on error
          setMessages((prev) =>
            prev.filter((m) => m.id !== tempUserId && m.id !== tempAssistantId),
          )
        },
        controller.signal,
      )
    },
    [sessionId, isStreaming],
  )

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return {
    messages,
    isLoading: isLoadingInitial,
    isStreaming,
    hasMoreMessages,
    loadOlderMessages,
    sendMessage,
    cancelStream,
  }
}

import {apiClient, getAccessToken} from '@/lib/api/apiClient'
import {ChatModeEnum, ChatSession, MessagesPage, SendMessagePayload, SessionsPage} from '../types'

export interface ChatStats {
  totalSessions: number
  totalMessages: number
  topMode: ChatModeEnum | null
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export const chatApi = {
  getStats: async (): Promise<ChatStats> => {
    const res = await apiClient.get<ChatStats>('/chat/stats')
    return res.data
  },

  getSessions: async (cursor?: string): Promise<SessionsPage> => {
    const params: Record<string, string> = {}
    if (cursor) params.cursor = cursor
    const res = await apiClient.get<SessionsPage>('/chat/sessions', {params})
    return res.data
  },

  createSession: async (): Promise<ChatSession> => {
    const res = await apiClient.post<ChatSession>('/chat/sessions')
    return res.data
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/chat/sessions/${sessionId}`)
  },

  toggleFavorite: async (sessionId: string): Promise<{isFavorite: boolean}> => {
    const res = await apiClient.patch<{isFavorite: boolean}>(`/chat/sessions/${sessionId}/favorite`)
    return res.data
  },

  getMessages: async (sessionId: string, cursor?: string): Promise<MessagesPage> => {
    const params: Record<string, string> = {}
    if (cursor) params.cursor = cursor
    const res = await apiClient.get<MessagesPage>(`/chat/sessions/${sessionId}/messages`, {params})
    return res.data
  },

  // SSE streaming — uses native fetch because axios does not support ReadableStream
  streamMessage: async (
    sessionId: string,
    payload: SendMessagePayload,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (msg: string) => void,
    signal: AbortSignal,
  ): Promise<void> => {
    const token = getAccessToken()
    const res = await fetch(`${BASE}/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
      },
      body: JSON.stringify(payload),
      signal,
    })

    if (!res.ok) {
      onError('Failed to send message')
      return
    }

    if (!res.body) {
      onError('Stream body unavailable')
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const {done, value} = await reader.read()
        if (done) break

        const raw = decoder.decode(value, {stream: true})
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              onError(parsed.error)
              return
            }
            if (parsed.chunk) {
              onChunk(parsed.chunk)
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } finally {
      reader.cancel()
    }

    onDone()
  },
}

export enum ChatModeEnum {
  FREE = 'free',
  EXPLAIN_WORD = 'explain-word',
  GRAMMAR_CHECK = 'grammar-check',
  CONVERSATION = 'conversation',
  TRANSLATE = 'translate',
}

export type MessageRole = 'user' | 'assistant'

export interface ChatSession {
  id: string
  title: string
  lastMode: ChatModeEnum
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  mode: ChatModeEnum
  isVoice: boolean
  createdAt: string
}

export interface SessionsPage {
  sessions: ChatSession[]
  nextCursor: string | null
  hasMore: boolean
}

export interface MessagesPage {
  messages: ChatMessage[]
  nextCursor: string | null
  hasMore: boolean
}

export interface SendMessagePayload {
  content: string
  mode: ChatModeEnum
  isVoice: boolean
}

export const MODE_LABELS: Record<ChatModeEnum, string> = {
  [ChatModeEnum.FREE]: '💬 Free Chat',
  [ChatModeEnum.EXPLAIN_WORD]: '📖 Explain Word',
  [ChatModeEnum.GRAMMAR_CHECK]: '✍️ Grammar Check',
  [ChatModeEnum.CONVERSATION]: '🗣️ Conversation',
  [ChatModeEnum.TRANSLATE]: '🔄 Translate',
}

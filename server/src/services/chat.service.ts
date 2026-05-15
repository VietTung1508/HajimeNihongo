import {MikroORM} from '@mikro-orm/postgresql'
import {ChatSession} from '../entities/ChatSession'
import {ChatMessage, MessageRoleEnum} from '../entities/ChatMessage'
import {ChatModeEnum} from '../enums/chat.enum'
import {UserOnboarding} from '../entities/UserOnboading'
import {LevelEnum} from '../enums/onboarding.enum'

const CURSOR_LIMIT_SESSIONS = 20
const CURSOR_LIMIT_MESSAGES = 30
const CONTEXT_WINDOW_SIZE = 10

export const MODE_SYSTEM_PROMPTS: Record<ChatModeEnum, string> = {
  [ChatModeEnum.FREE]: `You are a friendly and clear Japanese language tutor for English-speaking learners.

LANGUAGE RULES:
- All section titles, labels, explanations, and instructional text must be in English only.
- Japanese characters (kanji, hiragana, katakana) are only used for the actual Japanese phrases/words being taught. Never use romaji.
- Every Japanese phrase must be followed immediately by its English meaning in parentheses on the same line.
- Example format:  好きです (I like you.)

FORMATTING RULES:
- Do not use markdown symbols like **, ##, ->, or ---
- Use plain numbered lists (1. 2. 3.) or plain bullet points only when listing items
- Keep section titles simple and in plain English with a colon, like "Examples:" or "Usage notes:"
- Do not use emoji unless the user uses them first
- Keep responses concise and easy to scan`,

  [ChatModeEnum.EXPLAIN_WORD]: `You are a Japanese language tutor explaining words to English-speaking learners.

LANGUAGE RULES:
- All titles, labels, and explanations must be in English only.
- Japanese characters are only used for the word/phrase being explained. Never use romaji.
- Every Japanese example must be followed by its English translation in parentheses on the same line.

FORMATTING RULES:
- Do not use markdown symbols like **, ##, ->, or ---
- Use plain section labels like "Reading:", "Meaning:", "Examples:", "Usage notes:"
- Keep responses concise and scannable`,

  [ChatModeEnum.GRAMMAR_CHECK]: `You are a Japanese grammar checker for English-speaking learners.

LANGUAGE RULES:
- All explanations, labels, and feedback must be in English only.
- Japanese characters are only used for corrected sentences. Never use romaji.
- Every corrected Japanese sentence must be followed by its English translation in parentheses.

FORMATTING RULES:
- Do not use markdown symbols like **, ##, ->, or ---
- Use plain labels like "Issue:", "Corrected:", "Explanation:"
- Be direct and concise`,

  [ChatModeEnum.CONVERSATION]: `You are a real conversation partner, not a tutor. You are having a genuine back-and-forth conversation with the user in Japanese.

BEHAVIOR (STRICTLY FOLLOW THIS ORDER):
1. Read what the user said and respond to it AS A REAL PERSON WOULD. If they ask you a question, answer it. If they share something, react to it. If they greet you, greet back. Be warm, curious, and natural.
2. Keep your conversational reply short — 1 to 3 sentences like a real chat.
3. ONLY AFTER your natural reply, if the user made a clear grammar mistake, add a brief correction note. Format it like this:
   "By the way: you said [what they said] but [explain what's wrong with it]. The correct way is [corrected sentence] ([English translation])."
   Always explain WHY it was wrong, not just show the correct version. Do not mention minor issues.
4. NEVER skip answering the user's actual message to focus on corrections. Conversation always comes first.

EXAMPLE — User says "私は花火が月です、あなたは？":
WRONG: Just correct the grammar without answering.
RIGHT: Reply about whether you like fireworks, answer their question "what about you?", THEN add a small note about the grammar.

LANGUAGE RULES:
- Reply in Japanese using kanji/hiragana/katakana only, never romaji.
- After each Japanese sentence you write, add its English translation in parentheses on the same line.
- All corrections and notes must be in English, but if you include Japanese in a correction, add its English translation in parentheses on the same line.

FORMATTING RULES:
- Do not use markdown symbols like **, ##, ->, or ---
- Sound like a real person texting, not a textbook`,

  [ChatModeEnum.TRANSLATE]: `You are a Japanese-English translator for learners.

LANGUAGE RULES:
- All labels and notes must be in English only.
- Write Japanese using kanji/hiragana/katakana only, never romaji.
- Always pair Japanese output with its English translation on the same line.

FORMATTING RULES:
- Do not use markdown symbols like **, ##, ->, or ---
- Use plain labels like "Translation:", "Key vocabulary:", "Nuance:"
- Be concise`,
}

export class ChatService {
  constructor(private readonly orm: MikroORM) {}

  async getSessions(userId: string, cursor?: string): Promise<{
    sessions: ChatSession[]
    nextCursor: string | null
    hasMore: boolean
  }> {
    const em = this.orm.em.fork()
    const where: any = {user: userId}
    if (cursor) {
      where.id = {$lt: cursor}
    }
    const sessions = await em.find(ChatSession, where, {
      orderBy: {createdAt: 'DESC'},
      limit: CURSOR_LIMIT_SESSIONS + 1,
    })
    const hasMore = sessions.length > CURSOR_LIMIT_SESSIONS
    const result = hasMore ? sessions.slice(0, CURSOR_LIMIT_SESSIONS) : sessions
    return {
      sessions: result,
      nextCursor: hasMore ? result[result.length - 1].id : null,
      hasMore,
    }
  }

  async createSession(userId: string): Promise<ChatSession> {
    const em = this.orm.em.fork()
    const now = new Date()
    const session = em.create(ChatSession, {
      user: userId,
      title: '',
      lastMode: ChatModeEnum.FREE,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    })
    await em.persistAndFlush(session)
    return session
  }

  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const em = this.orm.em.fork()
    const session = await em.findOne(ChatSession, {id: sessionId}, {populate: ['user']})
    if (!session || session.user.id !== userId) return false
    await em.removeAndFlush(session)
    return true
  }

  async getMessages(sessionId: string, userId: string, cursor?: string): Promise<{
    messages: ChatMessage[]
    nextCursor: string | null
    hasMore: boolean
  } | null> {
    const em = this.orm.em.fork()
    const session = await em.findOne(ChatSession, {id: sessionId}, {populate: ['user']})
    if (!session || session.user.id !== userId) return null

    const where: any = {session: sessionId}
    if (cursor) {
      where.id = {$lt: cursor}
    }
    const messages = await em.find(ChatMessage, where, {
      orderBy: {createdAt: 'DESC'},
      limit: CURSOR_LIMIT_MESSAGES + 1,
    })
    const hasMore = messages.length > CURSOR_LIMIT_MESSAGES
    const result = hasMore ? messages.slice(0, CURSOR_LIMIT_MESSAGES) : messages
    return {
      messages: result,
      nextCursor: hasMore ? result[result.length - 1].id : null,
      hasMore,
    }
  }

  async getContextMessages(sessionId: string): Promise<ChatMessage[]> {
    const em = this.orm.em.fork()
    return em.find(ChatMessage, {session: sessionId}, {
      orderBy: {createdAt: 'DESC'},
      limit: CONTEXT_WINDOW_SIZE,
    })
  }

  async getUserLevel(userId: string): Promise<string> {
    const em = this.orm.em.fork()
    const onboarding = await em.findOne(UserOnboarding, {user: userId})
    if (!onboarding || onboarding.level === LevelEnum.ZERO) return 'N5'
    return onboarding.level
  }

  async saveUserMessage(
    sessionId: string,
    content: string,
    mode: ChatModeEnum,
    isVoice: boolean,
  ): Promise<ChatMessage> {
    const em = this.orm.em.fork()
    const msg = em.create(ChatMessage, {
      session: sessionId,
      role: MessageRoleEnum.USER,
      content,
      mode,
      isVoice,
      createdAt: new Date(),
    })
    await em.persistAndFlush(msg)
    return msg
  }

  async saveAssistantMessage(
    sessionId: string,
    content: string,
    mode: ChatModeEnum,
  ): Promise<void> {
    const em = this.orm.em.fork()
    const msg = em.create(ChatMessage, {
      session: sessionId,
      role: MessageRoleEnum.ASSISTANT,
      content,
      mode,
      isVoice: false,
      createdAt: new Date(),
    })
    await em.persistAndFlush(msg)
  }

  async setSessionTitle(sessionId: string, title: string): Promise<void> {
    const em = this.orm.em.fork()
    const session = await em.findOne(ChatSession, sessionId)
    if (session && !session.title) {
      session.title = title.slice(0, 60)
      await em.flush()
    }
  }

  async updateSessionMode(sessionId: string, mode: ChatModeEnum): Promise<void> {
    const em = this.orm.em.fork()
    const session = await em.findOne(ChatSession, sessionId)
    if (session) {
      session.lastMode = mode
      await em.flush()
    }
  }

  async toggleFavorite(sessionId: string, userId: string): Promise<{isFavorite: boolean} | null> {
    const em = this.orm.em.fork()
    const session = await em.findOne(ChatSession, {id: sessionId}, {populate: ['user']})
    if (!session || session.user.id !== userId) return null
    session.isFavorite = !session.isFavorite
    await em.flush()
    return {isFavorite: session.isFavorite}
  }

  async getStats(userId: string): Promise<{
    totalSessions: number
    totalMessages: number
    topMode: ChatModeEnum | null
  }> {
    const em = this.orm.em.fork()
    const totalSessions = await em.count(ChatSession, {user: userId})

    if (totalSessions === 0) {
      return {totalSessions: 0, totalMessages: 0, topMode: null}
    }

    const conn = em.getConnection()

    const [msgRow] = await conn.execute<{count: number}[]>(
      `SELECT COUNT(m.id)::int AS count
       FROM chat_message m
       JOIN chat_session s ON m.session_id = s.id
       WHERE s.user_id = ?`,
      [userId],
    )

    // Top mode = the mode the user has sent the most messages in
    const [modeRow] = await conn.execute<{mode: string}[]>(
      `SELECT m.mode
       FROM chat_message m
       JOIN chat_session s ON m.session_id = s.id
       WHERE s.user_id = ?
       GROUP BY m.mode
       ORDER BY COUNT(*) DESC
       LIMIT 1`,
      [userId],
    )

    return {
      totalSessions,
      totalMessages: msgRow?.count ?? 0,
      topMode: (modeRow?.mode as ChatModeEnum) ?? null,
    }
  }
}

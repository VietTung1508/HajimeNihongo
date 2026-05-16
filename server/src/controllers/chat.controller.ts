import {Request, Response} from 'express'
import {DI} from '../utils/di'
import {ChatModeEnum} from '../enums/chat.enum'
import {MODE_SYSTEM_PROMPTS} from '../services/chat.service'

export const listSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const cursor = req.query.cursor as string | undefined
    const result = await DI.chatService!.getSessions(userId, cursor)
    res.json(result)
  } catch (error) {
    console.error('Error listing chat sessions:', error)
    res.status(500).json({error: 'Failed to list sessions'})
  }
}

export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const session = await DI.chatService!.createSession(userId)
    res.status(201).json(session)
  } catch (error: any) {
    console.error('Error creating chat session:', error)
    res.status(500).json({error: 'Failed to create session', detail: error?.message})
  }
}

export const toggleSessionFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const sessionId = req.params.id as string
    const result = await DI.chatService!.toggleFavorite(sessionId, userId)
    if (!result) return res.status(403).json({error: 'Session not found or access denied'})
    res.json(result)
  } catch (error) {
    console.error('Error toggling session favorite:', error)
    res.status(500).json({error: 'Failed to update session'})
  }
}

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const sessionId = req.params.id as string
    const deleted = await DI.chatService!.deleteSession(sessionId, userId)
    if (!deleted) {
      return res.status(403).json({error: 'Session not found or access denied'})
    }
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting chat session:', error)
    res.status(500).json({error: 'Failed to delete session'})
  }
}

export const listMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const sessionId = req.params.id as string
    const cursor = req.query.cursor as string | undefined
    const result = await DI.chatService!.getMessages(sessionId, userId, cursor)
    if (!result) {
      return res.status(403).json({error: 'Session not found or access denied'})
    }
    res.json(result)
  } catch (error) {
    console.error('Error listing chat messages:', error)
    res.status(500).json({error: 'Failed to list messages'})
  }
}

export const getChatStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const stats = await DI.chatService!.getStats(userId)
    res.json(stats)
  } catch (error) {
    console.error('Error getting chat stats:', error)
    res.status(500).json({error: 'Failed to get chat stats'})
  }
}

export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const sessionId = req.params.id as string

  // Validate body before setting SSE headers
  const {content, mode, isVoice} = req.body as {
    content: string
    mode: ChatModeEnum
    isVoice: boolean
  }

  if (!content || !content.trim()) {
    return res.status(400).json({error: 'Message content cannot be empty'})
  }

  if (!Object.values(ChatModeEnum).includes(mode)) {
    return res.status(400).json({error: 'Invalid mode'})
  }

  // Verify session ownership before opening stream
  const ownerCheck = await DI.chatService!.getMessages(sessionId, userId)
  if (!ownerCheck) {
    return res.status(403).json({error: 'Session not found or access denied'})
  }

  // Open SSE stream
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Register abort controller before any async work
  const controller = new AbortController()
  req.on('close', () => controller.abort())

  try {
    // Persist user message
    await DI.chatService!.saveUserMessage(sessionId, content.trim(), mode, isVoice)

    // Auto-title session from first message
    await DI.chatService!.setSessionTitle(sessionId, content.trim())

    // Track last used mode
    await DI.chatService!.updateSessionMode(sessionId, mode)

    // Context: last 10 messages (DESC from DB → reverse to ASC for Mistral)
    const contextMessages = await DI.chatService!.getContextMessages(sessionId)
    const history = [...contextMessages].reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // Build system prompt with JLPT level
    const level = await DI.chatService!.getUserLevel(userId)
    const systemPrompt = `${MODE_SYSTEM_PROMPTS[mode]} Adjust complexity for JLPT ${level}. IMPORTANT: Always use real Japanese characters (kanji, hiragana, katakana). Never write Japanese words in romaji. EXCEPTION: When rejecting an off-topic question per scope rules, respond ONLY in plain English with no Japanese characters: "Sorry, I can only support you with questions related to Japanese language learning."`

    // Call Mistral streaming API (OpenAI-compatible endpoint)
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {role: 'system', content: systemPrompt},
          ...history,
        ],
        stream: true,
      }),
      signal: controller.signal,
    })

    if (!mistralRes.ok) {
      const errBody = await mistralRes.text().catch(() => '')
      console.error('Mistral API error:', mistralRes.status, errBody)
      res.write(`data: ${JSON.stringify({error: `AI service unavailable (${mistralRes.status})`})}\n\n`)
      res.end()
      return
    }

    // Pipe stream chunks to client
    const reader = mistralRes.body!.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const {done, value} = await reader.read()
      if (done) break

      const raw = decoder.decode(value, {stream: true})
      for (const line of raw.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const text = parsed.choices?.[0]?.delta?.content
          if (text) {
            fullContent += text
            res.write(`data: ${JSON.stringify({chunk: text})}\n\n`)
          }
        } catch {
          // skip malformed SSE lines from Mistral
        }
      }
    }

    // Persist complete assistant response then close stream
    if (fullContent) {
      await DI.chatService!.saveAssistantMessage(sessionId, fullContent, mode)
    }
    res.write(`data: [DONE]\n\n`)
    res.end()
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Client disconnected — discard partial content, do not save
      res.end()
      return
    }
    console.error('Error in sendMessage SSE:', error)
    res.write(`data: ${JSON.stringify({error: 'Internal server error'})}\n\n`)
    res.end()
  }
}

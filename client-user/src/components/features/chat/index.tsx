'use client'

import {useState, useEffect, useRef} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {PanelLeftOpen} from 'lucide-react'
import {ChatModeEnum} from './types'
import {useChatMessages} from './hook/useChatMessages'
import {useSidebarResize} from './hook/useSidebarResize'
import {useChatSessions} from './hook/useChatSessions'
import {SessionSidebar} from './components/SessionSidebar'
import {MessageList} from './components/MessageList'
import {ModeChips} from './components/ModeChips'
import {ChatInputBar} from './components/ChatInputBar'

const ChatPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<ChatModeEnum>(ChatModeEnum.FREE)
  const [pendingAsk, setPendingAsk] = useState<string | null>(null)
  const hasAutoCreated = useRef(false)
  const {width, isCollapsed, onDragStart, toggleCollapse} = useSidebarResize()
  const {createSessionAsync} = useChatSessions()

  const {messages, isLoading, isStreaming, hasMoreMessages, loadOlderMessages, sendMessage} =
    useChatMessages(activeSessionId)

  useEffect(() => {
    const ask = searchParams.get('ask')
    if (!ask || hasAutoCreated.current) return
    hasAutoCreated.current = true
    const decoded = decodeURIComponent(ask)
    setPendingAsk(decoded)
    router.replace('/chat')
    createSessionAsync().then((session) => {
      setActiveSessionId(session.id)
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSessionDeleted = (id: string) => {
    if (activeSessionId === id) setActiveSessionId(null)
  }

  return (
    <div className="flex flex-1 bg-slate-950 overflow-hidden">
      <SessionSidebar
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={setActiveSessionId}
        onSessionDeleted={handleSessionDeleted}
        width={width}
        isCollapsed={isCollapsed}
        onDragStart={onDragStart}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Expand button shown when sidebar is collapsed */}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            title="Open sidebar"
            className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-[#082630] hover:bg-[#0d3547] text-slate-400 hover:text-slate-200 p-1.5 rounded-r-md border-r border-y border-slate-700/40 transition-colors"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Loading…
          </div>
        ) : (
          <MessageList
            messages={messages}
            hasMoreMessages={hasMoreMessages}
            onLoadOlder={loadOlderMessages}
            sessionId={activeSessionId}
            isStreaming={isStreaming}
          />
        )}

        {activeSessionId && (
          <>
            <ModeChips activeMode={activeMode} onChange={setActiveMode} />
            <ChatInputBar
              activeMode={activeMode}
              isStreaming={isStreaming}
              onSend={sendMessage}
              initialValue={pendingAsk ?? undefined}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default ChatPage

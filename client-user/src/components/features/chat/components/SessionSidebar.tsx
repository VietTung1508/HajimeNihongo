'use client'

import {useEffect, useRef, useState} from 'react'
import {PanelLeftClose, Plus} from 'lucide-react'
import {useChatSessions} from '../hook/useChatSessions'
import {SessionItem} from './SessionItem'
import {ConfirmDeleteModal} from './ConfirmDeleteModal'
import {ChatSession} from '../types'

interface SessionSidebarProps {
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: (id: string) => void
  onSessionDeleted?: (id: string) => void
  width: number
  isCollapsed: boolean
  onDragStart: (e: React.MouseEvent) => void
  onToggleCollapse: () => void
}

export const SessionSidebar = ({
  activeSessionId,
  onSelectSession,
  onNewSession,
  onSessionDeleted,
  width,
  isCollapsed,
  onDragStart,
  onToggleCollapse,
}: SessionSidebarProps) => {
  const {
    sessions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    createSession,
    isCreating,
    deleteSession,
    toggleFavorite,
  } = useChatSessions()

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      {threshold: 0.1},
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleNew = () => {
    createSession(undefined, {onSuccess: (s) => onNewSession(s.id)})
  }

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return
    deleteSession(pendingDeleteId)
    onSessionDeleted?.(pendingDeleteId)
    setPendingDeleteId(null)
  }

  const favorites = sessions.filter((s) => s.isFavorite)
  const recent = sessions.filter((s) => !s.isFavorite)
  const pendingSession = sessions.find((s) => s.id === pendingDeleteId)

  const renderSession = (s: ChatSession) => (
    <SessionItem
      key={s.id}
      session={s}
      isActive={s.id === activeSessionId}
      onClick={() => onSelectSession(s.id)}
      onRequestDelete={setPendingDeleteId}
      onToggleFavorite={toggleFavorite}
    />
  )

  return (
    <>
      <div
        className={`flex-shrink-0 min-w-0 flex flex-col bg-[#082630] relative overflow-hidden ${
          isCollapsed
            ? 'pointer-events-none border-r-0'
            : 'border-r border-slate-700/40'
        }`}
        style={{width: isCollapsed ? 0 : width}}
        aria-hidden={isCollapsed}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700/40 flex-shrink-0">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 whitespace-nowrap">
            Chats
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNew}
              disabled={isCreating}
              title="New chat"
              className="w-6 h-6 flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleCollapse}
              title="Close sidebar"
              className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5 min-w-0">
          {isLoading ? (
            <p className="text-xs text-slate-500 px-2 py-6 text-center">Loading…</p>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <p className="text-xs text-slate-500 whitespace-nowrap">No chats yet</p>
              <button
                onClick={handleNew}
                disabled={isCreating}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
              >
                Start a new chat →
              </button>
            </div>
          ) : (
            <>
              {favorites.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 px-2 pt-1 pb-0.5 font-semibold whitespace-nowrap">
                    Starred
                  </p>
                  {favorites.map(renderSession)}
                  {recent.length > 0 && <div className="h-px bg-slate-700/40 my-1.5 mx-1" />}
                </>
              )}
              {recent.length > 0 && (
                <>
                  {favorites.length > 0 && (
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 px-2 pb-0.5 font-semibold whitespace-nowrap">
                      Recent
                    </p>
                  )}
                  {recent.map(renderSession)}
                </>
              )}
            </>
          )}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <p className="text-xs text-slate-500 text-center py-1">Loading…</p>
          )}
        </div>

        {/* Resize drag handle */}
        <div
          onMouseDown={onDragStart}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500/40 active:bg-indigo-500/60 transition-colors z-10"
          title="Drag to resize"
        />
      </div>

      {pendingDeleteId && pendingSession && (
        <ConfirmDeleteModal
          sessionTitle={pendingSession.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </>
  )
}

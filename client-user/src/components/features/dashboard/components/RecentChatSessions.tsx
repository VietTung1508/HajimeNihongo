'use client'

import {useQuery} from '@tanstack/react-query'
import {useRouter} from 'next/navigation'
import dayjs from 'dayjs'
import {Card} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Loader2, MessageSquare, Star, MessagesSquare, Layers} from 'lucide-react'
import {chatApi} from '@/components/features/chat/services/api'
import {ChatModeEnum} from '@/components/features/chat/types'

const MODE_COLORS: Record<ChatModeEnum, string> = {
  [ChatModeEnum.FREE]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  [ChatModeEnum.EXPLAIN_WORD]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  [ChatModeEnum.GRAMMAR_CHECK]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  [ChatModeEnum.CONVERSATION]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  [ChatModeEnum.TRANSLATE]: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
}

const MODE_SHORT_LABELS: Record<ChatModeEnum, string> = {
  [ChatModeEnum.FREE]: 'Free Chat',
  [ChatModeEnum.EXPLAIN_WORD]: 'Explain Word',
  [ChatModeEnum.GRAMMAR_CHECK]: 'Grammar Check',
  [ChatModeEnum.CONVERSATION]: 'Conversation',
  [ChatModeEnum.TRANSLATE]: 'Translate',
}

const DEFAULT_MODE_COLOR = MODE_COLORS[ChatModeEnum.FREE]

export function RecentChatSessions() {
  const router = useRouter()

  const {data: stats, isLoading: statsLoading} = useQuery({
    queryKey: ['chat-stats-dashboard'],
    queryFn: chatApi.getStats,
    staleTime: 60 * 1000,
  })

  const {data: sessionsPage, isLoading: sessionsLoading} = useQuery({
    queryKey: ['chat-sessions-dashboard'],
    queryFn: () => chatApi.getSessions(),
    staleTime: 60 * 1000,
  })

  const isLoading = statsLoading || sessionsLoading
  const sessions = sessionsPage?.sessions.slice(0, 3) ?? []

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="flex items-center justify-center p-8 h-full">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
              <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">AI Chat</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your recent sessions</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/chat')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors cursor-pointer"
          >
            See all →
          </button>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="px-6 pb-4 grid grid-cols-3 gap-3 flex-shrink-0">
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <Layers className="h-4 w-4 mx-auto mb-1.5 text-slate-400" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{stats.totalSessions}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sessions</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <MessagesSquare className="h-4 w-4 mx-auto mb-1.5 text-slate-400" />
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{stats.totalMessages}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Messages</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <MessageSquare className="h-4 w-4 mx-auto mb-1.5 text-slate-400" />
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight mt-0.5">
              {stats.topMode ? (MODE_SHORT_LABELS[stats.topMode] ?? '—') : '—'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">Top mode</div>
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="flex-1 px-6 pb-6">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No sessions yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Start a chat with your AI Japanese tutor</p>
            <button
              onClick={() => router.push('/chat')}
              className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Open AI Chat →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push('/chat')}
                className="group p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 font-medium flex-shrink-0 ${MODE_COLORS[session.lastMode] ?? DEFAULT_MODE_COLOR}`}
                      >
                        {MODE_SHORT_LABELS[session.lastMode] ?? session.lastMode}
                      </Badge>
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {session.title || 'Untitled session'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dayjs(session.updatedAt).format('MMM D, YYYY')}
                    </p>
                  </div>
                  {session.isFavorite && (
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

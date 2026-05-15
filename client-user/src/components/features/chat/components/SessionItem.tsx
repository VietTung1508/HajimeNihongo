'use client'

import {Star, Trash2} from 'lucide-react'
import {ChatSession, MODE_LABELS} from '../types'
import {cn} from '@/lib/utils'

interface SessionItemProps {
  session: ChatSession
  isActive: boolean
  onClick: () => void
  onRequestDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export const SessionItem = ({
  session,
  isActive,
  onClick,
  onRequestDelete,
  onToggleFavorite,
}: SessionItemProps) => {
  const label = session.title || 'New Chat'
  const modeLabel = MODE_LABELS[session.lastMode]
  const date = new Date(session.updatedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(session.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRequestDelete(session.id)
  }

  return (
    <div
      className={cn(
        'group relative w-full rounded-lg transition-colors duration-150 border-l-2',
        isActive ? 'bg-[#1a4558] border-indigo-400' : 'hover:bg-[#0d3547] border-transparent',
      )}
    >
      <button onClick={onClick} className="w-full text-left px-3 py-2.5 pr-14">
        <div className="flex items-center gap-1.5 min-w-0">
          {session.isFavorite && (
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />
          )}
          <p className="text-sm text-slate-200 truncate font-medium leading-tight">{label}</p>
        </div>
        <p className="text-[11px] text-slate-400/70 mt-0.5 truncate">
          {modeLabel} · {date}
        </p>
      </button>

      {/* Hover actions */}
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={handleFav}
          title={session.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <Star
            className={cn(
              'w-3.5 h-3.5 transition-colors',
              session.isFavorite
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-400 hover:text-amber-400',
            )}
          />
        </button>
        <button
          onClick={handleDelete}
          title="Delete chat"
          className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

import {ChatMessage} from '../types'
import {cn} from '@/lib/utils'

interface MessageBubbleProps {
  message: ChatMessage
}

export const MessageBubble = ({message}: MessageBubbleProps) => {
  const isUser = message.role === 'user'
  const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={cn('flex gap-2.5 items-end', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm text-sm">
          🤖
        </div>
      )}
      <div
        className={cn(
          'max-w-[72%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
          isUser
            ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-slate-800/80 text-slate-100 rounded-2xl rounded-bl-sm ring-1 ring-slate-700/50',
        )}
      >
        {message.content || (
          <div className="flex items-center gap-1 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
          </div>
        )}
        <div className={cn('flex items-center gap-1 mt-1', isUser ? 'justify-end' : 'justify-start')}>
          {isUser && message.isVoice && <span className="text-indigo-200 text-[10px]">🎤</span>}
          <span className={cn('text-[10px]', isUser ? 'text-indigo-200/70' : 'text-slate-500')}>
            {time}
          </span>
        </div>
      </div>
    </div>
  )
}

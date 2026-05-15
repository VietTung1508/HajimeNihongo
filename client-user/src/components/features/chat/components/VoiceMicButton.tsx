import {Mic, MicOff} from 'lucide-react'
import {cn} from '@/lib/utils'

interface VoiceMicButtonProps {
  supported: boolean
  isListening: boolean
  onMouseDown: () => void
  onMouseUp: () => void
}

export const VoiceMicButton = ({
  supported,
  isListening,
  onMouseDown,
  onMouseUp,
}: VoiceMicButtonProps) => {
  if (!supported) {
    return (
      <div title="Voice input not supported in this browser" className="cursor-not-allowed">
        <button
          disabled
          className="w-8 h-8 rounded-lg bg-slate-700/60 border border-slate-700/60 flex items-center justify-center opacity-40"
        >
          <MicOff className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    )
  }

  return (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
      title="Hold to speak"
      className={cn(
        'w-8 h-8 rounded-lg border flex items-center justify-center transition-colors',
        isListening
          ? 'bg-red-600 border-red-500 animate-pulse'
          : 'bg-slate-700/60 border-slate-700/60 hover:bg-slate-700',
      )}
    >
      <Mic className={cn('w-3.5 h-3.5', isListening ? 'text-white' : 'text-slate-400')} />
    </button>
  )
}

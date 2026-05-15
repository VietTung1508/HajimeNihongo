import {ChatModeEnum, MODE_LABELS} from '../types'
import {cn} from '@/lib/utils'

interface ModeChipsProps {
  activeMode: ChatModeEnum
  onChange: (mode: ChatModeEnum) => void
}

const MODES = Object.values(ChatModeEnum)

export const ModeChips = ({activeMode, onChange}: ModeChipsProps) => (
  <div className="flex gap-1.5 flex-wrap px-4 pt-2 pb-1 border-t border-slate-800/60">
    {MODES.map((mode) => (
      <button
        key={mode}
        onClick={() => onChange(mode)}
        className={cn(
          'text-[11px] font-medium px-3 py-1 rounded-full transition-all duration-150',
          mode === activeMode
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
            : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 border border-slate-700/60',
        )}
      >
        {MODE_LABELS[mode]}
      </button>
    ))}
  </div>
)

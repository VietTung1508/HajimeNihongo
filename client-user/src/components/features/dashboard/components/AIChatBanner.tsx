'use client'

import {useRouter} from 'next/navigation'

export const AIChatBanner = () => {
  const router = useRouter()

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center justify-between gap-4">
      {/* Moving shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none animate-shimmer"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="flex items-center gap-3 relative">
        <span className="text-3xl animate-float" aria-hidden>🤖</span>
        <div>
          <p className="text-white font-semibold text-sm">
            ✨ New — AI Japanese Tutor
          </p>
          <p className="text-indigo-200 text-xs mt-0.5">
            Chat, speak, check grammar — all tailored to your JLPT level.
          </p>
        </div>
      </div>

      <div className="relative flex-shrink-0">
        {/* Pulse ring behind button */}
        <span className="absolute inset-0 rounded-lg bg-white/30 animate-ping" />
        <button
          onClick={() => router.push('/chat')}
          className="relative bg-white text-indigo-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Try AI Chat →
        </button>
      </div>
    </div>
  )
}

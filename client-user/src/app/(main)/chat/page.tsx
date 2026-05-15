'use client'

import {Suspense} from 'react'
import Link from 'next/link'
import {LayoutDashboard} from 'lucide-react'
import ChatPage from '@/components/features/chat'

export default function Page() {
  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Link
        href="/dashboard"
        title="Back to Dashboard"
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 bg-[#082630] hover:bg-[#0d3547] text-slate-400 hover:text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700/40 transition-colors shadow-lg"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        Dashboard
      </Link>
      <main className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Loading…
          </div>
        }>
          <ChatPage />
        </Suspense>
      </main>
    </div>
  )
}

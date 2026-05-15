'use client'

import {useEffect} from 'react'
import {createPortal} from 'react-dom'
import {AlertTriangle, X} from 'lucide-react'

interface ConfirmDeleteModalProps {
  sessionTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDeleteModal = ({sessionTitle, onConfirm, onCancel}: ConfirmDeleteModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-100 font-semibold text-base">Delete this chat?</h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              <span className="text-slate-200 font-medium break-words">
                &ldquo;{sessionTitle || 'New Chat'}&rdquo;
              </span>{' '}
              will be permanently deleted and cannot be recovered.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
          >
            Delete forever
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

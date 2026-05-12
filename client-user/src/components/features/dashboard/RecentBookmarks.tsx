'use client'

import {useQuery} from '@tanstack/react-query'
import {Card} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Loader2} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {Bookmark} from 'lucide-react'
import {apiClient} from '@/lib/api/apiClient'

interface BookmarkItem {
  id: number
  type: 'word' | 'grammar'
  japanese: string
  meaning?: string
}

export function RecentBookmarks() {
  const router = useRouter()

  const {data: wordBookmarks, isLoading: wordLoading} = useQuery({
    queryKey: ['bookmarks-word-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/bookmarks/word?limit=5')
      return response.data.data.slice(0, 5).map((item: any) => ({
        id: item.id,
        type: 'word' as const,
        japanese: item.kanji || item.reading,
        meaning: item.meanings?.[0]
      }))
    }
  })

  const {data: grammarBookmarks, isLoading: grammarLoading} = useQuery({
    queryKey: ['bookmarks-grammar-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/bookmarks/grammar?limit=5')
      return response.data.data.slice(0, 5).map((item: any) => ({
        id: item.id,
        type: 'grammar' as const,
        japanese: item.grammarPoint,
        meaning: item.meaning
      }))
    }
  })

  if (wordLoading || grammarLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="flex items-center justify-center p-8 h-full">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  const allBookmarks: BookmarkItem[] = [...(wordBookmarks || []), ...(grammarBookmarks || [])].slice(0, 5)

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col">
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Bookmark className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Bookmarks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Quick access</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6">
        {allBookmarks.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No bookmarks yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bookmark vocabulary and grammar to find them easily</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allBookmarks.map((bookmark) => {
              const typeColors = {
                word: 'border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20',
                grammar: 'border-pink-200 dark:border-pink-900/30 bg-pink-50/50 dark:bg-pink-950/20'
              }
              const badgeColors = {
                word: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                grammar: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800'
              }

              return (
                <div
                  key={`${bookmark.type}-${bookmark.id}`}
                  className={`group p-3 rounded-lg border ${typeColors[bookmark.type]} hover:shadow-sm transition-all cursor-pointer`}
                  onClick={() => router.push(bookmark.type === 'word' ? `/vocabulary/${bookmark.id}` : `/grammar/${bookmark.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${badgeColors[bookmark.type]}`}>
                          {bookmark.type}
                        </Badge>
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {bookmark.japanese}
                        </span>
                      </div>
                      {bookmark.meaning && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {bookmark.meaning}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

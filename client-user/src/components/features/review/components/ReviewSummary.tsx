'use client'

import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {CheckCircle, RotateCcw, Home, Award} from 'lucide-react'
import {cn} from '@/lib/utils'
import {ReviewItem} from '../types'

interface ReviewSummaryProps {
  total: number
  correct: number
  retries: number
  masteredItems: ReviewItem[]
  onBackToDashboard: () => void
}

export function ReviewSummary({total, correct, retries, masteredItems, onBackToDashboard}: ReviewSummaryProps) {
  const accuracy = total > 0 ? Math.min(100, Math.max(0, Math.round((correct / total) * 100))) : 0
  const incorrect = total - correct

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#082630] via-[#0a3542] to-[#082630]">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#c74a4a] to-[#d65a5a] shadow-lg shadow-[#c74a4a]/30">
            <Award className="size-10 text-white" />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
            Session Complete
          </h1>
          <p className="text-lg text-[#9FA9AD]">
            Here's how you did
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{total}</p>
              <p className="text-sm text-[#9FA9AD]">Total</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{correct}</p>
              <p className="text-sm text-green-300/70">Correct</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{retries}</p>
              <p className="text-sm text-orange-300/70">Retries</p>
            </CardContent>
          </Card>
        </div>

        {/* Accuracy Progress */}
        <Card className="mb-6 border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium text-white">Accuracy</span>
              <span className="text-2xl font-bold text-[#c74a4a]">{accuracy}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  accuracy >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' : accuracy >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                )}
                style={{width: `${accuracy}%`}}
              />
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 text-sm text-[#9FA9AD]">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="size-3 text-green-400" />
                {correct} correct
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="size-3 text-orange-400" />
                {retries} retries
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card className="mb-8 border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            {accuracy >= 80 ? (
              <div className="space-y-4">
                <p className="text-white">
                  Excellent work! You've mastered this material.
                </p>
                {masteredItems.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-[#9FA9AD] mb-3">Items you mastered in this session:</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {masteredItems.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="p-3 rounded-lg bg-white/5 border border-white/10 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <span className="px-2 py-0.5 text-xs rounded bg-[#c74a4a]/20 text-[#c74a4a] uppercase font-medium">
                              {item.type}
                            </span>
                            <div className="flex-1 min-w-0">
                              {item.type === 'word' ? (
                                <>
                                  <p className="font-medium text-white text-sm truncate">
                                    {item.kanji || item.reading}
                                  </p>
                                  {item.meanings && item.meanings[0] && (
                                    <p className="text-xs text-[#9FA9AD] truncate">
                                      {item.meanings[0]}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <p className="font-medium text-white text-sm truncate">
                                    {item.grammarPoint}
                                  </p>
                                  <p className="text-xs text-[#9FA9AD] truncate">
                                    {item.meaning}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : accuracy >= 60 ? (
              <p className="text-white">
                Good effort! Keep practicing to improve.
              </p>
            ) : (
              <p className="text-white">
                Keep studying! Review the material and try again.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={onBackToDashboard}
            className="gap-2 bg-gradient-to-r from-[#c74a4a] to-[#d65a5a] text-white shadow-lg shadow-[#c74a4a]/30 hover:from-[#b33d3d] hover:to-[#c74a4a]"
          >
            <Home className="size-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

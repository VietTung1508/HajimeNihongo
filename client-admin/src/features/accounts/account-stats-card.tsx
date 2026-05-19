import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AccountStats } from '@/types/account'
import { BookOpen, Flame, GraduationCap, RotateCcw, Target, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
  sub?: string
}

function StatTile({ label, value, icon, iconBg, sub }: StatTileProps) {
  return (
    <div className="rounded-lg border bg-card px-4 py-4 flex items-start gap-3">
      <div className={cn('rounded-md p-2 shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

interface AccountStatsCardProps {
  stats: AccountStats
}

export function AccountStatsCard({ stats }: AccountStatsCardProps) {
  const accuracyColor =
    stats.accuracyPercent >= 80 ? 'bg-emerald-500' :
    stats.accuracyPercent >= 60 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile
            label="Current Streak"
            value={`${stats.currentStreak}d`}
            icon={<Flame className="h-4 w-4 text-orange-600" />}
            iconBg="bg-orange-50"
            sub={stats.currentStreak === 1 ? '1 day' : undefined}
          />
          <StatTile
            label="Longest Streak"
            value={`${stats.longestStreak}d`}
            icon={<Trophy className="h-4 w-4 text-amber-600" />}
            iconBg="bg-amber-50"
          />
          <StatTile
            label="Words Learned"
            value={stats.wordsLearned}
            icon={<BookOpen className="h-4 w-4 text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <StatTile
            label="Grammar Learned"
            value={stats.grammarLearned}
            icon={<GraduationCap className="h-4 w-4 text-purple-600" />}
            iconBg="bg-purple-50"
          />
          <StatTile
            label="Total Reviews"
            value={stats.totalReviews}
            icon={<RotateCcw className="h-4 w-4 text-slate-600" />}
            iconBg="bg-slate-100"
            sub={`${stats.correctReviews} correct`}
          />
          <StatTile
            label="Accuracy"
            value={`${stats.accuracyPercent}%`}
            icon={<Target className="h-4 w-4 text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
        </div>

        {/* Accuracy bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Answer accuracy</span>
            <span className="font-medium text-foreground">{stats.accuracyPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', accuracyColor)}
              style={{ width: `${Math.min(stats.accuracyPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm flex items-center justify-between">
          <span className="text-muted-foreground">Daily sessions completed</span>
          <span className="text-xl font-bold">{stats.dailyLearnSessions}</span>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

const PACE_CONFIG = [
  { key: 'RELAX', label: 'Relax', className: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'DETERMINED', label: 'Determined', className: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { key: 'RIGOROUS', label: 'Rigorous', className: 'bg-orange-50 border-orange-200 text-orange-700' },
]

interface LearningInsightsCardProps {
  usersByJlptTarget: Record<string, number>
  studyPaceDistribution: Record<string, number>
  isLoading: boolean
  isError: boolean
}

export function LearningInsightsCard({
  usersByJlptTarget,
  studyPaceDistribution,
  isLoading,
  isError,
}: LearningInsightsCardProps) {
  const counts = JLPT_LEVELS.map(l => usersByJlptTarget[l] ?? 0)
  const max = Math.max(1, ...counts)

  const totalPace = Object.values(studyPaceDistribution).reduce((a, b) => a + b, 0)
  const pacePercent = (key: string) =>
    totalPace === 0 ? 0 : Math.round(((studyPaceDistribution[key] ?? 0) / totalPace) * 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Learning Insights</CardTitle>
        <CardDescription className="text-xs">User JLPT targets & study pace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <p className="text-sm text-destructive">Failed to load learning insights.</p>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Target JLPT Level</p>
              <div className="space-y-1.5">
                {JLPT_LEVELS.map((level, i) => (
                  <div key={level} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-muted-foreground shrink-0">{level}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      {isLoading ? (
                        <Skeleton className="h-full w-full" />
                      ) : (
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${(counts[i] / max) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="w-16 text-right text-muted-foreground">
                      {isLoading ? '—' : `${counts[i].toLocaleString()} users`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Study Pace</p>
              <div className="flex gap-2">
                {PACE_CONFIG.map(({ key, label, className }) => (
                  <div key={key} className={`flex-1 border rounded-md p-2 text-center ${className}`}>
                    <p className="text-base font-bold">
                      {isLoading ? '—' : `${pacePercent(key)}%`}
                    </p>
                    <p className="text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

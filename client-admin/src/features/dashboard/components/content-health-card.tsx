import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

interface LevelBarsProps {
  data: Record<string, number>
  color: string
  isLoading: boolean
}

function LevelBars({ data, color, isLoading }: LevelBarsProps) {
  const counts = JLPT_LEVELS.map(l => data[l] ?? 0)
  const max = Math.max(1, ...counts)

  return (
    <div className="space-y-1.5">
      {JLPT_LEVELS.map((level, i) => (
        <div key={level} className="flex items-center gap-2 text-xs">
          <span className="w-6 text-muted-foreground shrink-0">{level}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${(counts[i] / max) * 100}%` }}
              />
            )}
          </div>
          <span className="w-10 text-right text-muted-foreground">
            {isLoading ? '—' : counts[i].toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

interface ContentHealthCardProps {
  vocabByLevel: Record<string, number>
  grammarByLevel: Record<string, number>
  isLoading: boolean
  isError: boolean
}

export function ContentHealthCard({ vocabByLevel, grammarByLevel, isLoading, isError }: ContentHealthCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Content Health</CardTitle>
        <CardDescription className="text-xs">Vocabulary & grammar by JLPT level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <p className="text-sm text-destructive">Failed to load content health data.</p>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Vocabulary</p>
              <LevelBars data={vocabByLevel} color="bg-blue-500" isLoading={isLoading} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Grammar</p>
              <LevelBars data={grammarByLevel} color="bg-amber-500" isLoading={isLoading} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AccountOnboarding } from '@/types/account'
import { BookOpen, Brain, CheckCircle2, GraduationCap, XCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  ZERO: { label: 'Beginner', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  N5:   { label: 'N5',       color: 'bg-red-50 text-red-700 border-red-200' },
  N4:   { label: 'N4',       color: 'bg-orange-50 text-orange-700 border-orange-200' },
  N3:   { label: 'N3',       color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  N2:   { label: 'N2',       color: 'bg-blue-50 text-blue-700 border-blue-200' },
  N1:   { label: 'N1',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
}
const PACE_CONFIG: Record<string, { label: string; color: string }> = {
  RELAX:      { label: 'Relaxed',    color: 'text-emerald-600' },
  DETERMINED: { label: 'Determined', color: 'text-amber-600' },
  RIGOROUS:   { label: 'Rigorous',   color: 'text-rose-600' },
}
const PREF_LABELS: Record<string, string> = {
  GRAMMAR: 'Grammar', VOCABULARY: 'Vocabulary', BOTH: 'Grammar & Vocabulary',
}

function OnboardingTile({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-4 py-3 space-y-1.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-semibold">{children}</div>
    </div>
  )
}

interface AccountOnboardingCardProps {
  onboarding: AccountOnboarding | null
}

export function AccountOnboardingCard({ onboarding }: AccountOnboardingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {!onboarding ? (
          <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
            <GraduationCap className="h-5 w-5 shrink-0" />
            <span>This user has not completed onboarding yet.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <OnboardingTile icon={<GraduationCap className="h-3.5 w-3.5" />} label="JLPT Level">
              {onboarding.level ? (
                <span className={cn('inline-block rounded-md border px-2 py-0.5 text-xs font-bold',
                  LEVEL_CONFIG[onboarding.level]?.color ?? 'bg-muted text-foreground border-border')}>
                  {LEVEL_CONFIG[onboarding.level]?.label ?? onboarding.level}
                </span>
              ) : '—'}
            </OnboardingTile>

            <OnboardingTile icon={<Zap className="h-3.5 w-3.5" />} label="Study Pace">
              {onboarding.studyPace ? (
                <span className={cn('font-semibold', PACE_CONFIG[onboarding.studyPace]?.color)}>
                  {PACE_CONFIG[onboarding.studyPace]?.label ?? onboarding.studyPace}
                </span>
              ) : '—'}
            </OnboardingTile>

            <OnboardingTile icon={<Brain className="h-3.5 w-3.5" />} label="Focus Area">
              <span className="text-foreground">
                {PREF_LABELS[onboarding.studyPreference] ?? onboarding.studyPreference}
              </span>
            </OnboardingTile>

            <OnboardingTile icon={<BookOpen className="h-3.5 w-3.5" />} label="Placement Test">
              {onboarding.hasTakenPlacementTest ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  {onboarding.placementTestCompletedAt
                    ? new Date(onboarding.placementTestCompletedAt).toLocaleDateString()
                    : 'Completed'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  Not taken
                </span>
              )}
            </OnboardingTile>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

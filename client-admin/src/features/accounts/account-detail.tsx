import { Link } from '@tanstack/react-router'
import { AlertCircle, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useAccountDetail } from './hooks/use-account-detail'
import { AccountProfileCard } from './account-profile-card'
import { AccountOnboardingCard } from './account-onboarding-card'
import { AccountStatsCard } from './account-stats-card'

interface AccountDetailProps {
  id: string
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-24 rounded-none" />
        <CardContent className="pt-0 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <Skeleton className="h-20 w-20 rounded-full ring-4 ring-background shrink-0" />
            <div className="space-y-2 pb-1">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AccountDetail({ id }: AccountDetailProps) {
  const { data, isLoading, isError } = useAccountDetail(id)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" className="-ml-2 h-7 gap-1.5 px-2" asChild>
          <Link to="/accounts">
            <Users className="h-3.5 w-3.5" />
            User Accounts
          </Link>
        </Button>
        <ChevronRight className="h-3.5 w-3.5" />
        {data
          ? <span className="font-medium text-foreground">{data.profile.username}</span>
          : <Skeleton className="h-4 w-24" />
        }
      </div>

      {isLoading && <DetailSkeleton />}

      {isError && (
        <Card>
          <CardContent className="flex items-center gap-3 py-10 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Account not found or access denied.</span>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <AccountProfileCard profile={data.profile} />
          <AccountOnboardingCard onboarding={data.onboarding} />
          <AccountStatsCard stats={data.stats} />
        </>
      )}
    </div>
  )
}

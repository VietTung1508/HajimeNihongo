import { Users, BookOpen, BookText, Languages } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TableCell, TableRow } from '@/components/ui/table'
import { DataTable, type TableColumn } from '@/components/core/data-table'
import { useDashboard } from './hooks/use-dashboard'
import { QuickActionsCard } from './components/quick-actions-card'
import { ContentHealthCard } from './components/content-health-card'
import { LearningInsightsCard } from './components/learning-insights-card'
import { TopBookmarksVocabCard, TopBookmarksGrammarCard } from './components/top-bookmarks-card'
import type { AdminDashboardAccount } from '@/lib/api/admin-dashboard-api'

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const STAT_CARDS = [
  { key: 'totalUsers' as const, label: 'Total Users', icon: Users, color: 'text-blue-600' },
  { key: 'totalVocabulary' as const, label: 'Vocabulary', icon: BookOpen, color: 'text-emerald-600' },
  { key: 'totalGrammar' as const, label: 'Grammar Points', icon: BookText, color: 'text-amber-600' },
  { key: 'totalKana' as const, label: 'Kana Sections', icon: Languages, color: 'text-violet-600' },
]

const RECENT_COLUMNS: TableColumn[] = [
  { header: '', className: 'w-10' },
  { header: 'Username' },
  { header: 'Email' },
  { header: 'Joined' },
]

const Dashboard = () => {
  const { data, isLoading, isError } = useDashboard()
  const navigate = useNavigate()

  const contentHealth = data?.contentHealth ?? { vocabByLevel: {}, grammarByLevel: {} }
  const learningInsights = data?.learningInsights ?? { usersByJlptTarget: {}, studyPaceDistribution: {} }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of HajimeNihongo platform</p>
      </div>

      {/* Row 1: Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon size={16} className={color} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : isError ? (
                <p className="text-2xl font-bold text-muted-foreground">—</p>
              ) : (
                <p className="text-2xl font-bold">{data?.stats[key].toLocaleString() ?? '—'}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Quick Actions */}
      <QuickActionsCard />

      {/* Row 3: Content Health + Learning Insights */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ContentHealthCard
          vocabByLevel={contentHealth.vocabByLevel}
          grammarByLevel={contentHealth.grammarByLevel}
          isLoading={isLoading}
          isError={isError}
        />
        <LearningInsightsCard
          usersByJlptTarget={learningInsights.usersByJlptTarget}
          studyPaceDistribution={learningInsights.studyPaceDistribution}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Row 4: Top Bookmarks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopBookmarksVocabCard
          data={data?.topBookmarkedVocab ?? []}
          isLoading={isLoading}
          isError={isError}
        />
        <TopBookmarksGrammarCard
          data={data?.topBookmarkedGrammar ?? []}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Row 5: Recent Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Accounts</CardTitle>
          <CardDescription>The 10 most recently registered users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isError ? (
            <p className="p-6 text-sm text-destructive">Failed to load dashboard data. Please refresh.</p>
          ) : (
            <DataTable
              columns={RECENT_COLUMNS}
              data={data?.recentAccounts ?? []}
              isLoading={isLoading}
              emptyMessage="No accounts yet"
              renderRow={(account: AdminDashboardAccount) => (
                <TableRow
                  key={account.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate({ to: '/accounts/$id', params: { id: account.id } })}
                >
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {account.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{account.username}</TableCell>
                  <TableCell className="text-muted-foreground">{account.email}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(account.createdAt)}</TableCell>
                </TableRow>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

import { Users, BookOpen, BookText, Languages } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { label: 'Total Users', icon: Users, color: 'text-blue-600' },
  { label: 'Vocabulary', icon: BookOpen, color: 'text-emerald-600' },
  { label: 'Grammar Points', icon: BookText, color: 'text-amber-600' },
  { label: 'Kana Sections', icon: Languages, color: 'text-violet-600' },
]

const Dashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of HajimeNihongo platform</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, icon: Icon, color }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon size={16} className={color} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Platform activity will appear here once connected to the API</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No recent activity
        </div>
      </CardContent>
    </Card>
  </div>
)

export default Dashboard

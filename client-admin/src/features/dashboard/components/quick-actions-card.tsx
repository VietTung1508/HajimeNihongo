import { useNavigate } from '@tanstack/react-router'
import { BookOpen, BookText, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ACTIONS = [
  { label: 'Add Vocabulary', icon: BookOpen, to: '/vocabulary', className: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: 'Add Grammar', icon: BookText, to: '/grammar', className: 'bg-amber-600 hover:bg-amber-700 text-white' },
  { label: 'Add Kana Section', icon: Languages, to: '/kana', className: 'bg-violet-600 hover:bg-violet-700 text-white' },
] as const

export function QuickActionsCard() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {ACTIONS.map(({ label, icon: Icon, to, className }) => (
          <Button
            key={to}
            size="sm"
            className={className}
            onClick={() => navigate({ to, search: { create: true } })}
          >
            <Icon size={14} className="mr-1.5" />
            {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

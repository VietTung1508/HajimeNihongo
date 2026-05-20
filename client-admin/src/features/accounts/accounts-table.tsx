import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { DataTable, type TableColumn } from '@/components/core/data-table'
import type { AccountListItem } from '@/types/account'

const LEVEL_LABELS: Record<string, string> = {
  ZERO: 'Beginner', N5: 'N5', N4: 'N4', N3: 'N3', N2: 'N2', N1: 'N1',
}
const PACE_LABELS: Record<string, string> = {
  RELAX: 'Relax', DETERMINED: 'Determined', RIGOROUS: 'Rigorous',
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface AccountsTableProps {
  accounts: AccountListItem[]
  isLoading: boolean
}

const COLUMNS: TableColumn[] = [
  { header: '', className: 'w-10' },
  { header: 'Username' },
  { header: 'Email' },
  { header: 'Level' },
  { header: 'Study Pace' },
  { header: 'Joined' },
  { header: 'Last Login' },
]

export function AccountsTable({ accounts, isLoading }: AccountsTableProps) {
  const navigate = useNavigate()

  return (
    <DataTable
      columns={COLUMNS}
      data={accounts}
      isLoading={isLoading}
      emptyMessage="No accounts found"
      renderRow={(account) => (
        <TableRow
          key={account.id}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => navigate({ to: '/accounts/$id', params: { id: account.id } })}
        >
          <TableCell>
            <Avatar className="h-8 w-8">
              <AvatarImage src={account.avatarUrl ?? undefined} alt={account.username} />
              <AvatarFallback className="text-xs">
                {account.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TableCell>
          <TableCell className="font-medium">{account.username}</TableCell>
          <TableCell className="text-muted-foreground">{account.email}</TableCell>
          <TableCell>
            {account.onboarding?.level
              ? <Badge variant="outline">{LEVEL_LABELS[account.onboarding.level] ?? account.onboarding.level}</Badge>
              : <span className="text-muted-foreground text-sm">—</span>
            }
          </TableCell>
          <TableCell>
            {account.onboarding?.studyPace
              ? PACE_LABELS[account.onboarding.studyPace] ?? account.onboarding.studyPace
              : <span className="text-muted-foreground text-sm">—</span>
            }
          </TableCell>
          <TableCell className="text-sm">{formatDate(account.createdAt)}</TableCell>
          <TableCell className="text-sm">{formatDate(account.lastLoginAt)}</TableCell>
        </TableRow>
      )}
    />
  )
}

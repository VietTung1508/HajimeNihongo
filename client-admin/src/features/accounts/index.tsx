import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TablePagination } from '@/components/data-table/pagination'
import { useAccounts } from './hooks/use-accounts'
import { AccountsTable } from './accounts-table'
import { AccountsFilters } from './accounts-filters'
import type { AccountFilters } from '@/types/account'

export default function Accounts() {
  const [filters, setFilters] = useState<AccountFilters>({ page: 1, limit: 20 })

  const { data, isLoading } = useAccounts(filters)

  const accounts = data?.data ?? []
  const total = data?.total ?? 0
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Accounts</h1>
          <p className="text-sm text-muted-foreground">
            {total > 0 ? `${total} registered users` : 'Client-user accounts'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>Client-user accounts registered on the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccountsFilters filters={filters} onChange={setFilters} />
          <AccountsTable accounts={accounts} isLoading={isLoading} />
          <TablePagination
            total={total}
            page={page}
            pageSize={limit}
            onPageChange={p => setFilters(f => ({ ...f, page: p }))}
            onPageSizeChange={size => setFilters(f => ({ ...f, limit: size, page: 1 }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}

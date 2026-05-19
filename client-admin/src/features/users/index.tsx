import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableToolbar } from '@/components/data-table/toolbar'
import { TablePagination } from '@/components/data-table/pagination'
import { adminUsersApi } from '@/lib/api/admin-users-api'
import { usePermission } from '@/hooks/use-permission'
import { UserFormModal, type CreatePayload, type EditPayload } from './user-form-modal'
import type { AdminUserListItem } from '@/types/rbac'

export default function Users() {
  const { can } = usePermission()
  const qc = useQueryClient()
  const [editUser, setEditUser] = useState<AdminUserListItem | undefined>()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminUsersApi.list,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditPayload }) =>
      adminUsersApi.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setEditUser(undefined); toast.success('User updated') },
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePayload) => adminUsersApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setCreateOpen(false); toast.success('User created') },
  })

  const deleteMutation = useMutation({
    mutationFn: adminUsersApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deleted') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to delete user'),
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q
      ? users.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      : users
  }, [users, search])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  )

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }

  const isSuperAdmin = (user: AdminUserListItem) =>
    user.roles.some(r => r.name === 'Super Admin')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage admin users and their roles</p>
        </div>
        {can('user:create') && (
          <Button onClick={() => setCreateOpen(true)}>Create User</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Admin Users</CardTitle>
          <CardDescription>All admin users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : paginated.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  {search ? 'No users match your search' : 'No users found'}
                </TableCell></TableRow>
              ) : paginated.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(r => <Badge key={r.id} variant="outline">{r.name}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {can('user:edit') && (
                      <Button variant="ghost" size="icon" onClick={() => setEditUser(user)} disabled={isSuperAdmin(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {can('user:delete') && (
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(user.id)} disabled={deleteMutation.isPending || isSuperAdmin(user)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      <UserFormModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={async (payload) => { await createMutation.mutateAsync(payload as CreatePayload) }}
        isSaving={createMutation.isPending}
      />
      <UserFormModal
        mode="edit"
        open={!!editUser}
        onClose={() => setEditUser(undefined)}
        onSave={async (payload) => { await updateMutation.mutateAsync({ id: editUser!.id, payload: payload as EditPayload }) }}
        user={editUser}
        isSaving={updateMutation.isPending}
      />
    </div>
  )
}

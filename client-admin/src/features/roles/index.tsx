import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Lock, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableToolbar } from '@/components/data-table/toolbar'
import { TablePagination } from '@/components/data-table/pagination'
import { rolesApi } from '@/lib/api/roles-api'
import { usePermission } from '@/hooks/use-permission'
import RoleFormModal from './role-form-modal'
import type { RoleListItem } from '@/types/rbac'

export default function Roles() {
  const { can } = usePermission()
  const qc = useQueryClient()
  const [modalState, setModalState] = useState<{ open: boolean; role?: RoleListItem }>({ open: false })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  })

  const createMutation = useMutation({
    mutationFn: ({ name, permissionIds }: { name: string; permissionIds: string[] }) =>
      rolesApi.create({ name, permissionIds }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setModalState({ open: false }); toast.success('Role created') },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name, permissionIds }: { id: string; name: string; permissionIds: string[] }) =>
      rolesApi.update(id, { name, permissionIds }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setModalState({ open: false }); toast.success('Role updated') },
  })

  const deleteMutation = useMutation({
    mutationFn: rolesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role deleted') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to delete role'),
  })

  const handleSave = async (name: string, permissionIds: string[]) => {
    if (modalState.role) {
      await updateMutation.mutateAsync({ id: modalState.role.id, name, permissionIds })
    } else {
      await createMutation.mutateAsync({ name, permissionIds })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? roles.filter(r => r.name.toLowerCase().includes(q)) : roles
  }, [roles, search])

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  )

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
        </div>
        {can('role:create') && (
          <Button size="sm" onClick={() => setModalState({ open: true })}>
            <Plus className="mr-1 h-4 w-4" /> Add Role
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>Define what each role can access on the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search roles..."
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : paginated.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  {search ? 'No roles match your search' : 'No roles found'}
                </TableCell></TableRow>
              ) : paginated.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
                      {role.name}
                      {role.isSystem && <Badge variant="secondary">System</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {role.permissions.length === 0 ? (
                        <span className="text-muted-foreground text-xs">No permissions</span>
                      ) : role.permissions.map(p => (
                        <Badge key={p.key} variant="outline" className="text-xs px-1.5 py-0 font-normal">
                          {p.key}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{role.userCount}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {role.isSystem ? (
                      <>
                        <Button variant="ghost" size="icon" disabled title="System roles cannot be edited">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled title="System roles cannot be deleted">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {can('role:edit') && (
                          <Button variant="ghost" size="icon" onClick={() => setModalState({ open: true, role })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {can('role:delete') && (
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(role.id)} disabled={deleteMutation.isPending}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </>
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

      <RoleFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false })}
        onSave={handleSave}
        role={modalState.role}
        isSaving={isSaving}
      />
    </div>
  )
}

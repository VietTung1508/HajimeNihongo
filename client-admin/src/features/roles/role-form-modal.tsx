import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { permissionsApi } from '@/lib/api/permissions-api'
import { rolesApi } from '@/lib/api/roles-api'
import type { RoleListItem } from '@/types/rbac'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (name: string, permissionIds: string[]) => Promise<void>
  role?: RoleListItem
  isSaving?: boolean
}

interface FormValues {
  name: string
}

const schema = yup.object({
  name: yup.string().trim().required('Role name is required'),
})

const ACTION_ORDER = ['view', 'create', 'edit', 'delete']
const ACTION_LABELS: Record<string, string> = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' }

export default function RoleFormModal({ open, onClose, onSave, role, isSaving }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '' },
  })

  const { data: groups = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsApi.list,
    staleTime: Infinity,
  })

  const { data: roleDetail } = useQuery({
    queryKey: ['roles', role?.id],
    queryFn: () => rolesApi.getById(role!.id),
    enabled: open && !!role?.id,
  })

  useEffect(() => {
    if (!open) return
    reset({ name: role?.name ?? '' })
    setSelected(new Set(roleDetail?.permissionIds ?? []))
  }, [open, role, roleDetail, reset])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = (groupPermIds: string[], allChecked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allChecked) {
        groupPermIds.forEach(id => next.delete(id))
      } else {
        groupPermIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const onSubmit = async ({ name }: FormValues) => {
    try {
      await onSave(name.trim(), [...selected])
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError('root', { type: 'server', message: message ?? 'Something went wrong. Please try again.' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 min-h-0 flex-1">
          <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">
                Role Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role-name"
                placeholder="e.g. Content Editor"
                aria-invalid={!!errors.name}
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Permissions</p>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Module</th>
                      <th className="px-4 py-2 font-medium text-center">All</th>
                      {ACTION_ORDER.map(a => (
                        <th key={a} className="px-4 py-2 font-medium text-center">{ACTION_LABELS[a]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group, i) => {
                      const groupPermIds = group.actions.map(a => a.id)
                      const checkedCount = groupPermIds.filter(id => selected.has(id)).length
                      const allChecked = groupPermIds.length > 0 && checkedCount === groupPermIds.length
                      const someChecked = checkedCount > 0 && !allChecked
                      return (
                        <tr key={group.module} className={i % 2 === 0 ? '' : 'bg-muted/40'}>
                          <td className="px-4 py-2 capitalize font-medium">{group.module}</td>
                          <td className="px-4 py-2">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                                onCheckedChange={() => toggleAll(groupPermIds, allChecked)}
                              />
                            </div>
                          </td>
                          {ACTION_ORDER.map(action => {
                            const perm = group.actions.find(a => a.action === action)
                            return (
                              <td key={action} className="px-4 py-2">
                                <div className="flex justify-center">
                                  {perm ? (
                                    <Checkbox
                                      checked={selected.has(perm.id)}
                                      onCheckedChange={() => toggle(perm.id)}
                                    />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

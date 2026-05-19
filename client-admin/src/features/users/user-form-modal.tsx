import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RoleSelector } from './role-selector'
import type { AdminUserListItem } from '@/types/rbac'

export interface CreatePayload {
  email: string
  username: string
  password: string
  roleIds: string[]
  gender?: string
  dateOfBirth?: string
}

export interface EditPayload {
  username: string
  roleIds: string[]
  gender?: string
  dateOfBirth?: string
}

interface Props {
  mode: 'create' | 'edit'
  open: boolean
  onClose: () => void
  onSave: (payload: CreatePayload | EditPayload) => Promise<void>
  user?: AdminUserListItem
  isSaving?: boolean
}

interface FormValues {
  username: string
  email: string
  password: string
  roleIds: string[]
  gender: string
  dateOfBirth: string
}

const createSchema = yup.object({
  username: yup.string().trim().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  roleIds: yup.array(yup.string().required()).min(1, 'Role is required').required(),
  gender: yup.string().default(''),
  dateOfBirth: yup.string().default(''),
})

const editSchema = yup.object({
  username: yup.string().trim().required('Name is required'),
  email: yup.string().default(''),
  password: yup.string().default(''),
  roleIds: yup.array(yup.string().required()).default([]),
  gender: yup.string().default(''),
  dateOfBirth: yup.string().default(''),
})

const DEFAULT_VALUES: FormValues = {
  username: '', email: '', password: '', roleIds: [], gender: '', dateOfBirth: '',
}

export function UserFormModal({ mode, open, onClose, onSave, user, isSaving }: Props) {
  const schema = useMemo(() => mode === 'create' ? createSchema : editSchema, [mode])

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && user) {
      reset({
        username: user.username,
        email: user.email,
        password: '',
        roleIds: user.roles.map(r => r.id),
        gender: user.gender ?? '',
        dateOfBirth: user.dateOfBirth ?? '',
      })
    } else {
      reset(DEFAULT_VALUES)
    }
  }, [open, mode, user, reset])

  const onSubmit = async (data: FormValues) => {
    const shared = {
      username: data.username.trim(),
      roleIds: data.roleIds,
      gender: data.gender || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
    }
    try {
      if (mode === 'create') {
        await onSave({ ...shared, email: data.email.trim(), password: data.password } as CreatePayload)
      } else {
        await onSave(shared as EditPayload)
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (message === 'Email already in use') {
        setError('email', { type: 'server', message })
      } else {
        setError('root', { type: 'server', message: message ?? 'Something went wrong. Please try again.' })
      }
    }
  }

  const title = mode === 'create' ? 'Create User' : 'Edit User'
  const saveLabel = mode === 'create' ? 'Create' : 'Save'

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uf-username">Name <span className="text-destructive">*</span></Label>
            <Input
              id="uf-username"
              placeholder="Username"
              aria-invalid={!!errors.username}
              className={errors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
              {...register('username')}
            />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uf-email">
              Email {mode === 'create' && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="uf-email"
              type="email"
              placeholder="email@example.com"
              disabled={mode === 'edit'}
              readOnly={mode === 'edit'}
              aria-invalid={!!errors.email}
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password — create only */}
          {mode === 'create' && (
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="uf-password">Password <span className="text-destructive">*</span></Label>
              <Input
                id="uf-password"
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          )}

          {/* Gender */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Roles */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Role {mode === 'create' && <span className="text-destructive">*</span>}</Label>
            <Controller
              name="roleIds"
              control={control}
              render={({ field }) => (
                <RoleSelector selectedIds={field.value} onChange={field.onChange} />
              )}
            />
            {errors.roleIds && (
              <p className="text-xs text-destructive">
                {(errors.roleIds as { message?: string }).message ?? 'Role is required'}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="uf-dob">Date of Birth</Label>
            <Input id="uf-dob" type="date" {...register('dateOfBirth')} />
          </div>

          {/* Root server error */}
          {errors.root && (
            <p className="col-span-2 text-sm text-destructive">{errors.root.message}</p>
          )}

          <DialogFooter className="col-span-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : saveLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

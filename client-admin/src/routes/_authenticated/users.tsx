import { createFileRoute } from '@tanstack/react-router'
import Users from '@/features/users'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function UsersPage() {
  const { can } = usePermission()
  if (!can('user:view')) return <AccessDenied />
  return <Users />
}

export const Route = createFileRoute('/_authenticated/users')({
  component: UsersPage,
})

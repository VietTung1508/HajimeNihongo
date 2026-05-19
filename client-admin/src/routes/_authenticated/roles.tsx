import { createFileRoute } from '@tanstack/react-router'
import Roles from '@/features/roles'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function RolesPage() {
  const { can } = usePermission()
  if (!can('role:view')) return <AccessDenied />
  return <Roles />
}

export const Route = createFileRoute('/_authenticated/roles')({
  component: RolesPage,
})

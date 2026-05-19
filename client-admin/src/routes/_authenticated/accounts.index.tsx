import { createFileRoute } from '@tanstack/react-router'
import Accounts from '@/features/accounts'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function AccountsPage() {
  const { can } = usePermission()
  if (!can('account:view')) return <AccessDenied />
  return <Accounts />
}

export const Route = createFileRoute('/_authenticated/accounts/')({
  component: AccountsPage,
})

import { createFileRoute } from '@tanstack/react-router'
import AccountDetail from '@/features/accounts/account-detail'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function AccountDetailPage() {
  const { can } = usePermission()
  const { id } = Route.useParams()
  if (!can('account:view')) return <AccessDenied />
  return <AccountDetail id={id} />
}

export const Route = createFileRoute('/_authenticated/accounts/$id')({
  component: AccountDetailPage,
})

import { createFileRoute } from '@tanstack/react-router'
import GrammarDetail from '@/features/grammar/grammar-detail'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function GrammarDetailPage() {
  const { can } = usePermission()
  const { id } = Route.useParams()
  if (!can('grammar:view')) return <AccessDenied />
  return <GrammarDetail id={Number(id)} />
}

export const Route = createFileRoute('/_authenticated/grammar/$id')({
  component: GrammarDetailPage,
})

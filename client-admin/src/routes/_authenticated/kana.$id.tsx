import { createFileRoute } from '@tanstack/react-router'
import KanaDetail from '@/features/kana/kana-detail'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function KanaDetailPage() {
  const { can } = usePermission()
  const { id } = Route.useParams()
  if (!can('kana:view')) return <AccessDenied />
  return <KanaDetail id={Number(id)} />
}

export const Route = createFileRoute('/_authenticated/kana/$id')({
  component: KanaDetailPage,
})

import { createFileRoute } from '@tanstack/react-router'
import VocabularyDetail from '@/features/vocabulary/vocabulary-detail'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function VocabularyDetailPage() {
  const { can } = usePermission()
  const { id } = Route.useParams()
  if (!can('vocabulary:view')) return <AccessDenied />
  return <VocabularyDetail id={Number(id)} />
}

export const Route = createFileRoute('/_authenticated/vocabulary/$id')({
  component: VocabularyDetailPage,
})

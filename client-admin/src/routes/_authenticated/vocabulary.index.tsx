import { createFileRoute } from '@tanstack/react-router'
import Vocabulary from '@/features/vocabulary'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function VocabularyPage() {
  const { can } = usePermission()
  if (!can('vocabulary:view')) return <AccessDenied />
  return <Vocabulary />
}

export const Route = createFileRoute('/_authenticated/vocabulary/')({
  component: VocabularyPage,
})

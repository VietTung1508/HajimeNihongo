import { createFileRoute } from '@tanstack/react-router'
import Vocabulary from '@/features/vocabulary'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function VocabularyPage() {
  const { can } = usePermission()
  // useSearch MUST be called before any conditional return (Rules of Hooks)
  const { create } = Route.useSearch()
  if (!can('vocabulary:view')) return <AccessDenied />
  return <Vocabulary autoOpen={create === true} />
}

export const Route = createFileRoute('/_authenticated/vocabulary/')({
  component: VocabularyPage,
  validateSearch: (search: Record<string, unknown>) => ({
    create: search.create === true || search.create === 'true',
  }),
})

import { createFileRoute } from '@tanstack/react-router'
import KanaPage from '@/features/kana'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function KanaIndexPage() {
  const { can } = usePermission()
  // useSearch MUST be called before any conditional return (Rules of Hooks)
  const { create } = Route.useSearch()
  if (!can('kana:view')) return <AccessDenied />
  return <KanaPage autoOpen={create === true} />
}

export const Route = createFileRoute('/_authenticated/kana/')({
  component: KanaIndexPage,
  validateSearch: (search: Record<string, unknown>) => ({
    create: search.create === true || search.create === 'true',
  }),
})

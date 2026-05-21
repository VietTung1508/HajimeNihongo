import { createFileRoute } from '@tanstack/react-router'
import Grammar from '@/features/grammar'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function GrammarPage() {
  const { can } = usePermission()
  // useSearch MUST be called before any conditional return (Rules of Hooks)
  const { create } = Route.useSearch()
  if (!can('grammar:view')) return <AccessDenied />
  return <Grammar autoOpen={create === true} />
}

export const Route = createFileRoute('/_authenticated/grammar/')({
  component: GrammarPage,
  validateSearch: (search: Record<string, unknown>) => ({
    create: search.create === true || search.create === 'true',
  }),
})

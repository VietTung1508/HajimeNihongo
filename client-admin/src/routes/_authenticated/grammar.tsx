import { createFileRoute } from '@tanstack/react-router'
import Grammar from '@/features/grammar'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function GrammarPage() {
  const { can } = usePermission()
  if (!can('grammar:view')) return <AccessDenied />
  return <Grammar />
}

export const Route = createFileRoute('/_authenticated/grammar')({
  component: GrammarPage,
})

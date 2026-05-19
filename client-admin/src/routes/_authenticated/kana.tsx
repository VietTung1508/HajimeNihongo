import { createFileRoute } from '@tanstack/react-router'
import Kana from '@/features/kana'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function KanaPage() {
  const { can } = usePermission()
  if (!can('kana:view')) return <AccessDenied />
  return <Kana />
}

export const Route = createFileRoute('/_authenticated/kana')({
  component: KanaPage,
})

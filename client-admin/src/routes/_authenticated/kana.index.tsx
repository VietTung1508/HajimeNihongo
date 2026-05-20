import { createFileRoute } from '@tanstack/react-router'
import KanaPage from '@/features/kana'
import AccessDenied from '@/components/access-denied'
import { usePermission } from '@/hooks/use-permission'

function KanaIndexPage() {
  const { can } = usePermission()
  if (!can('kana:view')) return <AccessDenied />
  return <KanaPage />
}

export const Route = createFileRoute('/_authenticated/kana/')({
  component: KanaIndexPage,
})

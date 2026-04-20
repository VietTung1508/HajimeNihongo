import AppLayout from '@/components/layout/AppLayout'
import {GrammarDetail} from '@/components/features/grammar/GrammarDetail'

interface PageProps {
  params: Promise<{id: string}>
}

export default async function GrammarDetailPage({params}: PageProps) {
  const {id} = await params
  return (
    <AppLayout>
      <GrammarDetail id={Number(id)} />
    </AppLayout>
  )
}
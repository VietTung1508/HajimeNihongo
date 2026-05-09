import AppLayout from '@/components/layout/AppLayout'
import {GrammarDetail} from '@/components/features/grammar/GrammarDetail'
import {LearnSessionBar} from '@/components/features/learn/components/LearnSessionBar'

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<{learn?: string}>
}

export default async function GrammarDetailPage({params, searchParams}: PageProps) {
  const {id} = await params
  const {learn} = await searchParams
  const learnItemId = learn ? Number(learn) : null

  return (
    <AppLayout>
      <GrammarDetail id={Number(id)} />
      {learnItemId && <LearnSessionBar learnItemId={learnItemId} />}
    </AppLayout>
  )
}

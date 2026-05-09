import AppLayout from '@/components/layout/AppLayout'
import {WordDetail} from '@/components/features/words/WordDetail'
import {LearnSessionBar} from '@/components/features/learn/components/LearnSessionBar'

interface PageProps {
  params: Promise<{id: string}>
  searchParams: Promise<{learn?: string}>
}

export default async function VocabularyDetailPage({params, searchParams}: PageProps) {
  const {id} = await params
  const {learn} = await searchParams
  const learnItemId = learn ? Number(learn) : null

  return (
    <AppLayout>
      <WordDetail />
      {learnItemId && <LearnSessionBar learnItemId={learnItemId} />}
    </AppLayout>
  )
}

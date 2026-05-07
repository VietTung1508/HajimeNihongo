'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {ModeSelector, type ReviewMode} from './components/ModeSelector'
import {FlashcardCard} from './components/FlashcardCard'
import {QuizCard} from './components/QuizCard'
import {InputCard} from './components/InputCard'
import {HybridCard} from './components/HybridCard'
import {ReviewProgress} from './components/ReviewProgress'
import {ReviewSettings} from './components/ReviewSettings'
import {ReviewSummary} from './components/ReviewSummary'
import {useReviewItems, useMarkAsMastered} from './hook/useReviewQueue'
import {ReviewItem} from './types'
import {Loader2, Inbox, LogOut} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ReviewPhase = 'mode-select' | 'reviewing' | 'summary'

interface ReviewStats {
  total: number
  correct: number
  retries: number
}

export function ReviewMain() {
  const router = useRouter()
  const {data: items, isLoading, error} = useReviewItems()
  const {markWord, markGrammar} = useMarkAsMastered()

  const [phase, setPhase] = useState<ReviewPhase>('mode-select')
  const [mode, setMode] = useState<ReviewMode>('flashcard')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState<ReviewStats>({total: 0, correct: 0, retries: 0})
  const [sessionItems, setSessionItems] = useState<ReviewItem[]>([])
  const [masteredItems, setMasteredItems] = useState<ReviewItem[]>([])
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false)

  useEffect(() => {
    if (items && items.items && items.items.length > 0 && sessionItems.length === 0) {
      setSessionItems(items.items)
      setStats(prev => ({...prev, total: items.items.length}))
    }
  }, [items, sessionItems.length])

  const handleModeSelect = (selectedMode: ReviewMode) => {
    setMode(selectedMode)
    setPhase('reviewing')
  }

  const handleAnswer = (correct: boolean) => {
    const currentItem = sessionItems[currentIndex]
    if (!currentItem) return

    if (correct) {
      setStats(prev => ({...prev, correct: prev.correct + 1}))

      if (currentItem.type === 'word') {
        markWord([currentItem.id])
      } else if (currentItem.type === 'grammar') {
        markGrammar([currentItem.id])
      }

      setMasteredItems(prev => [...prev, currentItem])
      setSessionItems(prev => prev.filter((_, index) => index !== currentIndex))

      setTimeout(() => {
        if (currentIndex >= sessionItems.length - 1) {
          setPhase('summary')
        }
      }, 100)
    } else {
      setStats(prev => ({...prev, retries: prev.retries + 1}))
    }
  }

  const handleRemove = () => {
    setStats(prev => ({...prev, retries: prev.retries + 1}))

    setSessionItems(prev => prev.filter((_, index) => index !== currentIndex))

    setTimeout(() => {
      if (currentIndex >= sessionItems.length - 1) {
        setPhase('summary')
      }
    }, 100)
  }

  const moveToNext = () => {
    if (currentIndex < sessionItems.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setPhase('summary')
    }
  }

  const handleNext = () => {
    moveToNext()
  }

  const handleEndSession = () => {
    setShowEndSessionDialog(true)
  }

  const confirmEndSession = () => {
    setShowEndSessionDialog(false)
    setPhase('summary')
  }

  const cancelEndSession = () => {
    setShowEndSessionDialog(false)
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto size-12 animate-spin text-[#c74a4a]" />
          <p className="text-lg text-muted-foreground">Loading review queue...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold">Failed to load review queue</h2>
          <p className="text-muted-foreground">
            Please check your connection and try again.
          </p>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!sessionItems || sessionItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <Inbox className="mx-auto size-20 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Review Queue is Empty</h2>
          <p className="text-muted-foreground">
            Add words or grammar points to your review queue to start studying.
          </p>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (phase === 'mode-select') {
    return <ModeSelector onModeSelect={handleModeSelect} />
  }

  if (phase === 'summary') {
    return (
      <ReviewSummary
        total={stats.total}
        correct={stats.correct}
        retries={stats.retries}
        masteredItems={masteredItems}
        onBackToDashboard={handleBackToDashboard}
      />
    )
  }

  const currentItem = sessionItems[currentIndex]
  const completedCount = stats.total - sessionItems.length

  return (
    <div className="container mx-auto min-h-screen px-4 py-8 max-w-4xl">
      <div className="mb-4">
        <ReviewSettings currentMode={mode} onModeChange={setMode} />
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex-1">
          <ReviewProgress current={completedCount} total={stats.total} />
        </div>
      </div>

      <div className="mb-8 flex items-center justify-center">
        {mode === 'flashcard' && (
          <FlashcardCard
            item={currentItem}
            onAnswer={handleAnswer}
            onRemove={handleRemove}
            onNext={handleNext}
          />
        )}
        {mode === 'quiz' && (
          <QuizCard
            item={currentItem}
            onAnswer={handleAnswer}
            onRemove={handleRemove}
            onNext={handleNext}
          />
        )}
        {mode === 'input' && (
          <InputCard
            item={currentItem}
            onAnswer={handleAnswer}
            onRemove={handleRemove}
            onNext={handleNext}
          />
        )}
        {mode === 'hybrid' && (
          <HybridCard
            item={currentItem}
            onAnswer={handleAnswer}
            onRemove={handleRemove}
            onNext={handleNext}
          />
        )}
      </div>

      <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Review Session?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose this current session. Items that passed will be mastered, and all items not answered yet will still remain in review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelEndSession}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
          variant="outline"
          size="sm"
          onClick={handleEndSession}
          className="gap-2 text-muted-foreground hover:text-destructive shrink-0 absolute right-4 top-4 z-10"
        >
          <LogOut className="size-4" />
          End Session
        </Button>
    </div>
  )
}

export {AddToReviewButton} from './components/AddToReviewButton'
export {ModeSelector} from './components/ModeSelector'
export {ReviewProgress} from './components/ReviewProgress'
export {ReviewSettings} from './components/ReviewSettings'
export {FlashcardCard} from './components/FlashcardCard'
export {QuizCard} from './components/QuizCard'
export {InputCard} from './components/InputCard'
export {HybridCard} from './components/HybridCard'
export {ReviewSummary} from './components/ReviewSummary'

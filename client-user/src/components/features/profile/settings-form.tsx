'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {toast} from 'sonner'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {useOnboarding, useUpdateOnboarding} from './hooks/use-settings'
import {LevelChangeModal} from './level-change-modal'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

const STUDY_PACES = [
  {value: 'RELAX', label: '🌿 Relax', desc: '2 items/day'},
  {value: 'DETERMINED', label: '💪 Determined', desc: '4 items/day'},
  {value: 'RIGOROUS', label: '🔥 Rigorous', desc: '6 items/day'},
]

const STUDY_PREFERENCES = [
  {value: 'GRAMMAR', label: '📖 Grammar only'},
  {value: 'VOCABULARY', label: '🈶 Vocabulary only'},
  {value: 'BOTH', label: '✨ Both'},
]

export function SettingsForm() {
  const router = useRouter()
  const {data, isLoading} = useOnboarding()
  const {mutate: updateOnboarding, isPending} = useUpdateOnboarding()

  const onboarding = data?.onboarding

  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedPace, setSelectedPace] = useState<string>('')
  const [selectedPreference, setSelectedPreference] = useState<string>('')
  const [showModal, setShowModal] = useState(false)

  // Pre-fill from fetched data
  useEffect(() => {
    if (onboarding) {
      setSelectedLevel(onboarding.level)
      setSelectedPace(onboarding.studyPace)
      setSelectedPreference(onboarding.studyPreference)
    }
  }, [onboarding])

  const handleSave = () => {
    if (!onboarding) return
    if (selectedLevel !== onboarding.level) {
      setShowModal(true)
      return
    }
    submitUpdate(false)
  }

  const submitUpdate = (redirectAfter: boolean) => {
    updateOnboarding(
      {
        level: selectedLevel,
        studyPace: selectedPace,
        studyPreference: selectedPreference,
      },
      {
        onSuccess: () => {
          if (redirectAfter) {
            router.push('/dashboard')
          } else {
            toast.success('Settings saved')
          }
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Failed to save settings')
        },
      },
    )
  }

  if (isLoading || !onboarding) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-4 bg-gray-200 rounded w-1/3' />
          <div className='h-4 bg-gray-200 rounded w-2/3' />
        </div>
      </div>
    )
  }

  return (
    <>
      {showModal && (
        <LevelChangeModal
          currentLevel={onboarding.level}
          newLevel={selectedLevel}
          isPending={isPending}
          onConfirm={() => submitUpdate(true)}
          onCancel={() => {
            setShowModal(false)
            setSelectedLevel(onboarding.level)
          }}
        />
      )}

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100'>

        {/* JLPT Level */}
        <div className='p-6'>
          <h3 className='text-base font-semibold text-gray-900'>JLPT Target Level</h3>
          <p className='text-sm text-gray-500 mt-1 mb-5'>
            Your current learning level. Changing this resets your placement test.
          </p>
          <div className='flex gap-2 flex-wrap'>
            {LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                  selectedLevel === level
                    ? 'border-teal-500 text-teal-700 bg-teal-50'
                    : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50',
                )}
              >
                {level}
              </button>
            ))}
          </div>
          <p className='text-xs text-gray-400 mt-3'>
            Currently: {onboarding.level} ·{' '}
            {onboarding.hasTakenPlacementTest ? 'Placement test completed' : 'Placement test pending'}
          </p>
        </div>

        {/* Study Pace */}
        <div className='p-6'>
          <h3 className='text-base font-semibold text-gray-900'>Study Pace</h3>
          <p className='text-sm text-gray-500 mt-1 mb-5'>
            How many items are added to your daily queue. Takes effect on the next daily batch.
          </p>
          <div className='flex gap-2 flex-wrap'>
            {STUDY_PACES.map(({value, label, desc}) => (
              <button
                key={value}
                onClick={() => setSelectedPace(value)}
                title={desc}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                  selectedPace === value
                    ? 'border-teal-500 text-teal-700 bg-teal-50'
                    : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Study Focus */}
        <div className='p-6'>
          <h3 className='text-base font-semibold text-gray-900'>Study Focus</h3>
          <p className='text-sm text-gray-500 mt-1 mb-5'>
            What type of content is added to your daily queue. Takes effect on the next daily batch.
          </p>
          <div className='flex gap-2 flex-wrap'>
            {STUDY_PREFERENCES.map(({value, label}) => (
              <button
                key={value}
                onClick={() => setSelectedPreference(value)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                  selectedPreference === value
                    ? 'border-teal-500 text-teal-700 bg-teal-50'
                    : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className='p-6 flex justify-end'>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className='bg-teal-600 hover:bg-teal-700'
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </>
  )
}

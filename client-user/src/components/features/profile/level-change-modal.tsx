'use client'

import {Button} from '@/components/ui/button'

const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1']

interface LevelChangeModalProps {
  currentLevel: string
  newLevel: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LevelChangeModal({
  currentLevel,
  newLevel,
  isPending,
  onConfirm,
  onCancel,
}: LevelChangeModalProps) {
  // LEVEL_ORDER = ['N5','N4','N3','N2','N1'] — higher index = harder level (N1 is hardest)
  // upgrade = moving to harder level = newLevel has a HIGHER index (e.g. N4→N3: 1→2)
  const isUpgrade =
    LEVEL_ORDER.indexOf(newLevel) > LEVEL_ORDER.indexOf(currentLevel)

  const bodyText = isUpgrade
    ? `You're switching from ${currentLevel} → ${newLevel}. This resets your placement test. You'll be redirected to take a new test for ${newLevel} to confirm your readiness.`
    : `You're switching from ${currentLevel} → ${newLevel}. This resets your placement test. You'll be redirected to take a new test for ${newLevel} to set your starting point.`

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6'>
        <h2 className='text-base font-semibold text-gray-900 mb-3'>
          Changing level requires a placement test
        </h2>
        <p className='text-sm text-gray-600 mb-2'>{bodyText}</p>
        <p className='text-sm text-gray-500 mb-6'>
          Your study pace and focus changes will also be saved.
        </p>
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className='bg-teal-600 hover:bg-teal-700'
          >
            {isPending ? 'Saving...' : 'Confirm & Take Placement Test →'}
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {toast} from 'sonner'
import {useUpdatePassword} from './hooks/use-profile'

export function ProfilePasswordForm() {
  const [isChanging, setIsChanging] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const {mutate: updatePassword, isPending} = useUpdatePassword()

  const handleCancel = () => {
    setIsChanging(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    updatePassword({currentPassword, newPassword}, {
      onSuccess: () => {
        handleCancel()
        toast.success('Password updated')
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message ?? 'Failed to update password')
      },
    })
  }

  return (
    <>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-base font-semibold text-gray-900'>Security</h3>
          <p className='text-sm text-gray-500 mt-0.5'>Manage your password and account security.</p>
        </div>
        {!isChanging && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsChanging(true)}
            className='border-gray-200 text-gray-700 hover:bg-gray-50'
          >
            Change Password
          </Button>
        )}
      </div>
      {isChanging && (
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 mt-5 pt-5 border-t border-gray-100'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='currentPassword' className='text-sm font-medium text-gray-700'>
              Current password
            </Label>
            <Input
              id='currentPassword'
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className='bg-white border-gray-200 text-gray-900'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='newPassword' className='text-sm font-medium text-gray-700'>
              New password
            </Label>
            <Input
              id='newPassword'
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='bg-white border-gray-200 text-gray-900'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='confirmPassword' className='text-sm font-medium text-gray-700'>
              Confirm new password
            </Label>
            <Input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='bg-white border-gray-200 text-gray-900'
            />
            {error && <p className='text-red-500 text-sm'>{error}</p>}
          </div>
          <div className='flex items-center gap-2 justify-end'>
            <Button
              type='button'
              variant='ghost'
              onClick={handleCancel}
              disabled={isPending}
              className='text-gray-600 hover:text-gray-900'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending} className='bg-teal-600 hover:bg-teal-700'>
              {isPending ? 'Saving...' : 'Update Password'}
            </Button>
          </div>
        </form>
      )}
    </>
  )
}

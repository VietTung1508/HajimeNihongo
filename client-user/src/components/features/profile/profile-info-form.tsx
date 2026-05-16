'use client'

import {useState} from 'react'
import {useAppDispatch, useAppSelector} from '@/redux/hooks'
import {updateUserProfile} from '@/redux/auth/authSlice'
import {setUser} from '@/lib/api/apiClient'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Lock} from 'lucide-react'
import {toast} from 'sonner'
import {useUpdateUsername} from './hooks/use-profile'

export function ProfileInfoForm() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [username, setUsername] = useState(user?.username ?? '')
  const [error, setError] = useState('')
  const {mutate: updateUsername, isPending} = useUpdateUsername()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      setError('Username cannot be empty')
      return
    }
    updateUsername(username.trim(), {
      onSuccess: (data) => {
        dispatch(updateUserProfile({username: data.username}))
        if (user) setUser({...user, username: data.username})
        toast.success('Username updated')
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message ?? 'Failed to update username')
      },
    })
  }

  return (
    <>
      <h3 className='text-base font-semibold text-gray-900 mb-1'>Account Info</h3>
      <p className='text-sm text-gray-500 mb-5'>Update your display name and view account details.</p>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='email' className='text-sm font-medium text-gray-700'>Email</Label>
          <div className='relative'>
            <Input
              id='email'
              value={user?.email ?? ''}
              disabled
              className='bg-gray-50 border-gray-200 text-gray-500 pr-10 cursor-not-allowed'
            />
            <Lock className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          </div>
          <p className='text-xs text-gray-400'>Email cannot be changed.</p>
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='username' className='text-sm font-medium text-gray-700'>Username</Label>
          <Input
            id='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='bg-white border-gray-200 text-gray-900 focus:border-teal-500'
          />
          {error && <p className='text-red-500 text-sm'>{error}</p>}
        </div>
        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending} className='bg-teal-600 hover:bg-teal-700'>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </>
  )
}

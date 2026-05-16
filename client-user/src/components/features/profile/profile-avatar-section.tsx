'use client'

import {useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '@/redux/hooks'
import {updateUserProfile} from '@/redux/auth/authSlice'
import {setUser} from '@/lib/api/apiClient'
import {AvatarCircle} from '@/components/ui/avatar-circle'
import {Button} from '@/components/ui/button'
import {toast} from 'sonner'
import {Camera, X} from 'lucide-react'
import {useUploadAvatar} from './hooks/use-profile'

export function ProfileAvatarSection() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const {mutate: uploadAvatar, isPending} = useUploadAvatar()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleDiscard = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(null)
    setPreviewUrl(null)
  }

  const handleSave = () => {
    if (!previewFile) return
    uploadAvatar(previewFile, {
      onSuccess: (data) => {
        dispatch(updateUserProfile({avatarUrl: data.avatarUrl}))
        if (user) setUser({...user, avatarUrl: data.avatarUrl})
        handleDiscard()
        toast.success('Avatar updated')
      },
      onError: () => {
        toast.error('Failed to upload avatar')
      },
    })
  }

  return (
    <>
      <div className='flex items-center justify-between mb-1'>
        <div>
          <h3 className='text-base font-semibold text-gray-900'>Profile Photo</h3>
          <p className='text-sm text-gray-500 mt-0.5'>JPG, PNG or GIF · Max 5MB</p>
        </div>
      </div>
      <div className='flex items-center gap-5 mt-4'>
        <div className='relative w-20 h-20 flex-shrink-0'>
          <AvatarCircle
            username={user?.username ?? ''}
            avatarUrl={previewUrl ?? user?.avatarUrl}
            size={80}
          />
          {previewUrl && (
            <button
              onClick={handleDiscard}
              className='absolute -top-1.5 -right-1.5 bg-white border border-gray-200 shadow-sm rounded-full p-0.5 hover:bg-gray-50 transition-colors z-10'
            >
              <X className='w-3 h-3 text-gray-600' />
            </button>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className='gap-2 border-gray-200 text-gray-700 hover:bg-gray-50'
          >
            <Camera className='w-4 h-4' />
            {previewUrl ? 'Change photo' : 'Upload photo'}
          </Button>
          {previewUrl && (
            <Button size='sm' disabled={isPending} onClick={handleSave} className='bg-teal-600 hover:bg-teal-700'>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />
    </>
  )
}

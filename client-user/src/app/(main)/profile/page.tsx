import {ProfileAvatarSection} from '@/components/features/profile/profile-avatar-section'
import {ProfileInfoForm} from '@/components/features/profile/profile-info-form'
import {ProfilePasswordForm} from '@/components/features/profile/profile-password-form'

export default function ProfilePage() {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Account</h1>
        <p className='text-sm text-gray-500 mt-1'>Manage your profile and account settings</p>
      </div>
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100'>
        <div className='p-6'>
          <ProfileAvatarSection />
        </div>
        <div className='p-6'>
          <ProfileInfoForm />
        </div>
        <div className='p-6'>
          <ProfilePasswordForm />
        </div>
      </div>
    </div>
  )
}

import {SettingsForm} from '@/components/features/profile/settings-form'

export default function ProfileSettingPage() {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
        <p className='text-sm text-gray-500 mt-1'>Update your learning preferences</p>
      </div>
      <SettingsForm />
    </div>
  )
}

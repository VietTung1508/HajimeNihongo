import AppLayout from '@/components/layout/AppLayout'
import ProfileSidebar from '@/components/features/profile/profile-sidebar'

export default function ProfileLayout({children}: {children: React.ReactNode}) {
  return (
    <AppLayout>
      <div className='bg-gray-50 min-h-screen'>
        <div className='max-w-5xl mx-auto px-4 py-10 flex gap-8'>
          <ProfileSidebar />
          <div className='flex-1 min-w-0'>{children}</div>
        </div>
      </div>
    </AppLayout>
  )
}

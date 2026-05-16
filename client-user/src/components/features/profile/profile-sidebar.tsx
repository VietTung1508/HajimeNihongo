'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {User, Settings} from 'lucide-react'
import {cn} from '@/lib/utils'

const navItems = [
  {label: 'Account', href: '/profile', icon: User},
  {label: 'Settings', href: '/profile/setting', icon: Settings},
]

export default function ProfileSidebar() {
  const pathname = usePathname()

  return (
    <aside className='w-52 flex-shrink-0 self-start sticky top-20'>
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='px-4 py-3 border-b border-gray-100'>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Settings</p>
        </div>
        <nav className='p-2'>
          {navItems.map(({label, href, icon: Icon}) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-teal-600' : 'text-gray-400')} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

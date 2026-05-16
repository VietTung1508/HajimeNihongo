'use client'

import Link from 'next/link'
import {Button} from '../ui/button'
import Container from './Container'
import {useEffect, useState} from 'react'
import {useAppSelector} from '@/redux/hooks'
import {User, BookOpen, Library, Bookmark, Zap, Languages, Bot} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {ChevronDown} from 'lucide-react'
import {useReviewItems} from '@/components/features/review/hook/useReviewQueue'
import {useTodayLearn} from '@/components/features/learn/hooks/useLearn'
import {useRouter} from 'next/navigation'
import {useAppDispatch} from '@/redux/hooks'
import {logout} from '@/redux/auth/authSlice'
import {AvatarCircle} from '@/components/ui/avatar-circle'
import {LogOut} from 'lucide-react'

const Header = () => {
  const [isSticky, setIsSticky] = useState(false)
  const {user, isAuthenticated} = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logout())
    router.push('/signin')
  }

  const {data: reviewData} = useReviewItems()
  const reviewCount = reviewData?.total ?? 0
  const {data: todayLearn} = useTodayLearn()
  const learnCount = todayLearn?.items?.filter((item) => !item.viewedAt).length ?? 0

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <div
      className={`bg-[#082630] w-full sticky top-0 z-50 transition-shadow duration-300 ${
        isSticky ? 'shadow-lg' : ''
      }`}
    >
      <Container>
        <div className='flex items-center justify-between min-h-10 py-4'>
          <Link href='/'>
            <h2 className='text-lg font-semibold text-white'>Hajime Nihongo</h2>
          </Link>
          <div className='items-center text-white flex gap-6'>
            {!isAuthenticated && (
              <>
                <a href='#testimonials'>Why it works</a>
                <a href='#testimonials'>Testimonials</a>
                <a href='#testimonials'>Pricing</a>
              </>
            )}
            {!isAuthenticated ? (
              <>
                <Link href='/signup'>
                  <Button>Try HajimeNihongo</Button>
                </Link>
                <Link href='/signin'>
                  <Button className='p-0' variant='ghost'>
                    Login
                  </Button>
                </Link>
              </>
            ) : (
              <div className='flex items-center gap-4'>
                <Link href='/learn' className='relative'>
                  <Button variant='ghost' className='text-white'>
                    Learn
                  </Button>
                  {learnCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1'>
                      {learnCount}
                    </span>
                  )}
                </Link>

                <Link href='/review' className='relative'>
                  <Button variant='ghost' className='text-white'>
                    Review
                  </Button>
                  {reviewCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1'>
                      {reviewCount}
                    </span>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='text-white flex items-center gap-1'
                    >
                      Content <ChevronDown className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href='/grammar' className='flex items-center gap-2'>
                        <BookOpen className='w-4 h-4' /> Grammar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/vocabulary' className='flex items-center gap-2'>
                        <Library className='w-4 h-4' /> Vocabulary
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center gap-2'>
                      <Link href='/bookmarks' className='flex items-center gap-2'>
                      <Bookmark className='w-4 h-4' /> Bookmarks
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='text-white flex items-center gap-1'
                    >
                      Practice <ChevronDown className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href='/kana' className='flex items-center gap-2'>
                        <Languages className='w-4 h-4' /> Hiragana & Katakana
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href='/chat' className='flex items-center gap-2'>
                        <Bot className='w-4 h-4' /> AI Chat
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='focus:outline-none cursor-pointer'>
                      <AvatarCircle
                        username={user?.username ?? ''}
                        avatarUrl={user?.avatarUrl}
                        size={32}
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href='/profile' className='flex items-center gap-2'>
                        <User className='w-4 h-4' /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className='flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500'
                    >
                      <LogOut className='w-4 h-4' /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Header

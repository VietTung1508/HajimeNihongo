'use client'

import Link from 'next/link'
import {Button} from '../ui/button'
import Container from './Container'
import {useEffect, useState} from 'react'
import {useAppSelector} from '@/redux/hooks'
import {User, BookOpen, Library, Bookmark, Zap, Languages} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {ChevronDown} from 'lucide-react'

const Header = () => {
  const [isSticky, setIsSticky] = useState(false)
  const {user, isAuthenticated} = useAppSelector((state) => state.auth)

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
                <Button variant='ghost' className='text-white'>
                  Review
                </Button>

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
                      <Bookmark className='w-4 h-4' /> Bookmarks
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
                    <DropdownMenuItem className='flex items-center gap-2'>
                      <Zap className='w-4 h-4' /> Cram
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center gap-2'>
                      <BookOpen className='w-4 h-4' /> Reading Practice
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/kana' className='flex items-center gap-2'>
                        <Languages className='w-4 h-4' /> Hiragana & Katakana
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className='flex items-center gap-2 cursor-pointer'>
                  <div className='flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full'>
                    <User className='text-black w-4 h-4' />
                  </div>
                  <p>{user?.username}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Header

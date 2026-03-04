'use client'

import Link from 'next/link'
import {Button} from '../ui/button'
import Container from './Container'
import {useEffect, useState} from 'react'
import {useAppSelector} from '@/redux/hooks'
import {User} from 'lucide-react'

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
        <div className='flex items-center justify-between min-h-10 py-1.5'>
          <Link href='/'>
            <h2 className='text-lg font-semibold text-white'>Hajime Nihongo</h2>
          </Link>
          <div className='items-center text-white flex gap-6'>
            <a href='#testimonials'>Why it works</a>
            <a href='#testimonials'>Testimonials</a>
            <a href='#testimonials'>Pricing</a>
            {!isAuthenticated ? (
              <>
                <Link href='/signup'>
                  <Button>Try HajimeNihongo</Button>
                </Link>
                <Link href='/signin'>
                  <Button
                    className='p-0 hover:bg-transparent hover:text-white'
                    variant='ghost'
                  >
                    Login
                  </Button>
                </Link>
              </>
            ) : (
              <div className='flex items-center gap-2 cursor-pointer'>
                <div className='flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full'>
                  <User className='text-black w-4 h-4' />
                </div>
                <p>{user?.username}</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Header

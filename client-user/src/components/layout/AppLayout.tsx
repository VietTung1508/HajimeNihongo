import React from 'react'
import Header from './Header'
import Footer from './Footer'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout = async ({children}: AppLayoutProps) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer  />
    </div>
  )
}

export default AppLayout

import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useSelector } from 'react-redux'
import { selectIsCollapsed } from '@/store'
import { STORAGE_KEY } from '@/store/slices/sidebar-slice'
import { TooltipProvider } from '@/components/ui/tooltip'
import Sidebar from './sidebar'
import Header from './header'

const AppLayout = () => {
  const isCollapsed = useSelector(selectIsCollapsed)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed])

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
          <TanStackRouterDevtools />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default AppLayout

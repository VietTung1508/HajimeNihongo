import {Menu, LogOut} from 'lucide-react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from '@tanstack/react-router'
import {toggleSidebar} from '@/store/slices/sidebar-slice'
import {selectUser} from '@/store'
import type {AppDispatch} from '@/store'
import {Button} from '@/components/ui/button'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {logout} from '@/lib/api/auth-service'

const Header = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  const handleLogout = () => {
    logout()
    navigate({to: '/sign-in'})
  }

  const initials = user?.username?.charAt(0).toUpperCase() ?? 'A'

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
        className="h-8 w-8"
      >
        <Menu size={18} />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{user?.username ?? 'Admin'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut size={14} className="mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default Header

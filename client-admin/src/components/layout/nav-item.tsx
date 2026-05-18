import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItemProps {
  icon: ReactNode
  label: string
  to: string
  isCollapsed: boolean
}

const NavItem = ({ icon, label, to, isCollapsed }: NavItemProps) => {
  const link = (
    <Link
      to={to}
      activeProps={{ className: 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm' }}
      inactiveProps={{
        className:
          'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      }}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
    >
      <span className="shrink-0">{icon}</span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

export default NavItem

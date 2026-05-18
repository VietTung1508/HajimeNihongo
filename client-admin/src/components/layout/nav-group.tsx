import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

interface NavGroupProps {
  icon: ReactNode
  label: string
  isCollapsed: boolean
  children: ReactNode
}

const NavGroup = ({ icon, label, isCollapsed, children }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isCollapsed) setIsOpen(false)
  }, [isCollapsed])

  if (isCollapsed) {
    return (
      <div
        title={label}
        className="flex cursor-pointer items-center justify-center rounded-md px-3 py-2 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <span className="shrink-0">{icon}</span>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronRight
          size={13}
          className={`shrink-0 text-sidebar-foreground/40 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-sidebar-border/50 pl-3">
          {children}
        </div>
      )}
    </div>
  )
}

export default NavGroup

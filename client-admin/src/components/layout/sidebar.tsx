import { useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Shield,
  UserCog,
  BookOpen,
  BookText,
  Languages,
  GraduationCap,
  Globe,
} from 'lucide-react'
import { selectIsCollapsed } from '@/store'
import { usePermission } from '@/hooks/use-permission'
import NavItem from './nav-item'
import NavGroup from './nav-group'

const Sidebar = () => {
  const isCollapsed = useSelector(selectIsCollapsed)
  const { can } = usePermission()

  return (
    <aside
      style={{ width: isCollapsed ? 52 : 220, transition: 'width 0.2s ease' }}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-12 shrink-0 items-center border-b border-sidebar-border/60 px-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#c74a4a]">
          <span className="text-xs font-bold text-white">H</span>
        </div>
        {!isCollapsed && (
          <span className="ml-2 truncate text-sm font-semibold text-sidebar-foreground">
            HajimeNihongo
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        <NavItem
          icon={<LayoutDashboard size={16} />}
          label="Dashboard"
          to="/"
          isCollapsed={isCollapsed}
        />

        {can('account:view') && (
          <NavItem
            icon={<UsersRound size={16} />}
            label="Accounts"
            to="/accounts"
            isCollapsed={isCollapsed}
          />
        )}

        {(can('user:view') || can('role:view')) && (
          <NavGroup icon={<UserCog size={16} />} label="User Settings" isCollapsed={isCollapsed}>
            {can('user:view') && (
              <NavItem icon={<Users size={16} />} label="Users" to="/users" isCollapsed={false} />
            )}
            {can('role:view') && (
              <NavItem icon={<Shield size={16} />} label="Roles" to="/roles" isCollapsed={false} />
            )}
          </NavGroup>
        )}

        {(can('vocabulary:view') || can('grammar:view') || can('kana:view')) && (
          <NavGroup
            icon={<GraduationCap size={16} />}
            label="Learning Content"
            isCollapsed={isCollapsed}
          >
            {can('vocabulary:view') && (
              <NavItem
                icon={<BookOpen size={16} />}
                label="Vocabulary"
                to="/vocabulary"
                isCollapsed={false}
              />
            )}
            {can('grammar:view') && (
              <NavItem
                icon={<BookText size={16} />}
                label="Grammar"
                to="/grammar"
                isCollapsed={false}
              />
            )}
            {can('kana:view') && (
              <NavItem
                icon={<Languages size={16} />}
                label="Kana"
                to="/kana"
                isCollapsed={false}
              />
            )}
          </NavGroup>
        )}

        <NavItem
          icon={<Globe size={16} />}
          label="Landing Page"
          to="/landing"
          isCollapsed={isCollapsed}
        />
      </nav>
    </aside>
  )
}

export default Sidebar

import { Link, useLocation } from '@tanstack/react-router'
import { Home, Search, Briefcase, MessageSquare, Bell, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sidebarStore, toggleSidebar } from '@/store/sidebar'
import { useStore } from '@tanstack/react-store'
import { SidebarProfileMenu } from './SidebarProfileMenu'

const EXPANDED_WIDTH = 256
const COLLAPSED_WIDTH = 80

export default function LeftSidebar() {
  const location = useLocation()
  const { isCollapsed } = useStore(sidebarStore)

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/services', icon: Briefcase, label: 'Services' },
    { href: '/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
  ]

  const sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH

  return (
    <nav
      className="hidden md:flex flex-col justify-between sticky top-0 h-screen transition-all duration-300 ease-in-out relative sidebar-bg"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
      }}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className={cn('p-6 flex items-center', isCollapsed && 'justify-center px-4')}>
          <Link to="/" className="flex items-center gap-3 group">
            {isCollapsed ? (
              <img src="/just-logo-symbol.svg" alt="LBF" className="w-10 h-10 drop-shadow-lg group-hover:scale-105 transition-transform" />
            ) : (
              <img src="/logo-with-name.svg" alt="Let's Be Friends" className="h-10 drop-shadow-lg group-hover:scale-[1.02] transition-transform" />
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-1 px-3 mt-2">
          {navItems.map((link) => {
            const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/')
            const Icon = link.icon
            return (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className={cn(
                    'flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium transition-all duration-200',
                    isCollapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-white/12 text-white shadow-sm'
                      : 'text-white/50 hover:bg-white/6 hover:text-white/80'
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-accent' : ''
                    )}
                    style={{
                      color: isActive ? '#e088c0' : undefined,
                    }}
                  />
                  {!isCollapsed && <span className="text-sm">{link.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Bottom Section - Profile */}
      <div className={cn('p-4 border-t border-white/8', isCollapsed && 'px-3')}>
        <SidebarProfileMenu isCollapsed={isCollapsed} />
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-[#2d1f33] hover:bg-[#3d2a45] border border-white/10 flex items-center justify-center transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100 shadow-md"
        style={{ opacity: 0.7 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-white/60" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-white/60" />
        )}
      </button>
    </nav>
  )
}

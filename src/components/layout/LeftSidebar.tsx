import { Link, useLocation } from '@tanstack/react-router'
import { useAuth, UserButton, SignedIn } from '@clerk/clerk-react'
import { Home, Search, MessageSquare, Bell, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sidebarStore, toggleSidebar } from '@/store/sidebar'
import { useStore } from '@tanstack/react-store'

const EXPANDED_WIDTH = 240
const COLLAPSED_WIDTH = 80

export default function LeftSidebar() {
  const location = useLocation()
  const { userId } = useAuth()
  const { isCollapsed } = useStore(sidebarStore)

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
  ]

  const sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH

  return (
    <nav
      className="hidden md:flex flex-col justify-between sticky top-0 h-screen transition-all duration-300 ease-in-out border-r border-white/5 relative"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        backgroundColor: 'hsl(320, 9%, 12%)',
      }}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className={cn('p-6 flex items-center', isCollapsed && 'justify-center px-4')}>
          <Link to="/" className="flex items-center">
            {isCollapsed ? (
              <img src="/just-logo-symbol.svg" width={45} height={50} alt="LBF" className="opacity-90" />
            ) : (
              <img src="/logo-with-name.svg" width={130} height={36} alt="Let's Be Friends" className="opacity-90" />
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-1 px-3">
          {navItems.map((link) => {
            const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/')
            const Icon = link.icon
            return (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-lg font-medium transition-all duration-200',
                    isCollapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-muted hover:bg-white/5 hover:text-white'
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-accent' : 'text-muted'
                    )}
                    style={{
                      color: isActive ? 'hsl(var(--color-primary))' : undefined,
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
      <SignedIn>
        <div className={cn('p-4 border-t border-white/5', isCollapsed && 'px-3')}>
          {userId && (
            <Link
              to="/profile/$userId"
              params={{ userId: userId }}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? 'Your Profile' : undefined}
            >
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: isCollapsed ? 'w-10 h-10' : 'w-9 h-9',
                  },
                }}
              />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate">Your Profile</span>
                  <span className="text-xs text-muted truncate">View profile</span>
                </div>
              )}
            </Link>
          )}
        </div>
      </SignedIn>

      {/* Toggle Button - Right Center */}
      <button
        onClick={toggleSidebar}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all duration-200 opacity-60 hover:opacity-100"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          backgroundColor: 'hsl(320, 9%, 12%)',
        }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-muted/70" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted/70" />
        )}
      </button>
    </nav>
  )
}

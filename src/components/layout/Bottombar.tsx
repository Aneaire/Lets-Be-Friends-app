import { Link, useLocation } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { Home, Search, MessageSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Bottombar() {
  const location = useLocation()
  const { userId } = useAuth()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: userId ? `/profile/${userId}` : '/auth/sign-in', icon: User, label: 'Profile' },
  ]

  return (
    <nav
      className={cn(
        'z-50 flex justify-around items-center w-full fixed left-0 bottom-0',
        'md:hidden border-t border-white/10 px-2 py-2 pb-safe'
      )}
      style={{ backgroundColor: 'hsl(320, 9%, 12%)' }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[64px]',
              isActive
                ? 'text-white bg-white/10'
                : 'text-muted hover:text-white'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                isActive && 'text-primary'
              )}
              style={{
                color: isActive ? 'hsl(var(--color-primary))' : undefined,
              }}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

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
    { href: '/notifications', icon: Bell, label: 'Alerts' },
    { href: userId ? `/profile/${userId}` : '/auth/sign-in', icon: User, label: 'Profile' },
  ]

  return (
    <nav
      className={cn(
        'z-50 flex justify-around items-center w-full fixed left-0 bottom-0',
        'md:hidden px-2 py-1.5 pb-safe glass-strong'
      )}
      style={{ borderTop: '1px solid rgba(232, 221, 210, 0.5)' }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px]',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className={cn(
              'p-1.5 rounded-xl transition-all duration-200',
              isActive && 'bg-primary/10'
            )}>
              <Icon
                className={cn(
                  'w-5 h-5 transition-all duration-200',
                  isActive && 'scale-110'
                )}
              />
            </div>
            <span className={cn(
              'text-[10px] font-medium',
              isActive && 'font-semibold'
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

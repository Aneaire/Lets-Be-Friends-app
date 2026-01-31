import { Link, useLocation } from '@tanstack/react-router'
import { Home, Search, MessageSquare, Bell, User } from 'lucide-react'

export default function Bottombar() {
  const location = useLocation()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/profile/me', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="z-50 flex justify-between items-center w-full fixed left-0 bottom-0 rounded-t-[20px] bg-bgLight px-3 py-2 md:hidden border-t border-dark-1/10">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.label}
            to={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 ${
              isActive ? 'text-white' : 'text-content'
            }`}
            style={{
              backgroundColor: isActive ? 'hsl(var(--color-accent1))' : 'transparent',
            }}
          >
            <Icon
              size={20}
              style={{
                fill: isActive ? 'white' : 'hsl(var(--color-accent1))',
                transition: 'fill 0.15s'
              }}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

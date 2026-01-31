import { Link, useLocation } from '@tanstack/react-router'
import { useAuth, UserButton, SignedIn } from '@clerk/clerk-react'
import { Home, Search, MessageSquare, Bell, LogOut } from 'lucide-react'

export default function LeftSidebar() {
  const location = useLocation()
  const { userId } = useAuth()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
  ]

  return (
    <nav className="hidden md:flex flex-col justify-between min-w-[270px] bg-bgLight px-6 py-10 sticky top-0 h-screen" style={{ borderRadius: '0 0 1rem 0' }}>
      <div className="flex flex-col gap-10">
        {/* Logo */}
        <Link to="/">
          <img src="/logo.svg" width={170} height={36} alt="Let's Be Friends" />
        </Link>

        {/* User Profile */}
        {userId && (
          <Link
            to="/profile/$userId"
            params={{ userId: userId }}
            className="flex gap-3 items-center transition-opacity hover:opacity-80"
          >
            <UserButton appearance={{ elements: { avatarBox: "w-14 h-14" } }} />
            <div className="flex flex-col">
              <p className="font-bold text-base text-content">Your Profile</p>
              <p className="text-xs text-textLight">View profile</p>
            </div>
          </Link>
        )}

        {/* Navigation Links */}
        <ul className="flex flex-col gap-6">
          {navItems.map((link) => {
            const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/')
            const Icon = link.icon
            return (
              <li key={link.label} className={isActive ? 'bg-accent-1' : ''}>
                <Link
                  to={link.href}
                  className={`flex gap-4 p-4 items-center rounded-lg text-content font-medium transition-all duration-150 ${isActive ? 'text-white' : 'hover:bg-accent-1 hover:text-white'}`}
                >
                  <Icon
                    size={24}
                    className={isActive ? 'text-white' : ''}
                    style={{
                      fill: isActive ? 'white' : 'hsl(var(--color-accent1))',
                      transition: 'fill 0.15s'
                    }}
                  />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Logout */}
      <SignedIn>
        <button className="flex items-center gap-4 p-4 text-content font-medium hover:bg-accent-1 hover:text-white rounded-lg transition-all duration-150">
          <LogOut
            size={21}
            style={{
              fill: 'hsl(var(--color-accent1))',
              transition: 'fill 0.15s'
            }}
            className="hover:fill-white"
          />
          <span>Log out</span>
        </button>
      </SignedIn>
    </nav>
  )
}

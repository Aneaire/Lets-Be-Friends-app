import { Link, useLocation } from '@tanstack/react-router'
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react'
import { Home, Search, MessageSquare, Bell } from 'lucide-react'

export default function Navigation() {
  const location = useLocation()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/discover', icon: Search, label: 'Discover' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <img src="/logo.svg" width={140} height={30} alt="Let's Be Friends" />
        </Link>

        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}

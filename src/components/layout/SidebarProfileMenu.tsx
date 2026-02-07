import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { StorageImage } from '@/components/StorageImage'
import { User, Settings, Calendar, LogOut, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SidebarProfileMenu({ isCollapsed }: { isCollapsed: boolean }) {
  const { userId: clerkId } = useAuth()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkId ? { clerkId } : 'skip',
  )

  if (!clerkId || !currentUser) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/6 transition-all duration-200 cursor-pointer outline-none',
            isCollapsed && 'justify-center',
          )}
          title={isCollapsed ? currentUser.fullName : undefined}
        >
          <StorageImage
            storageId={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className={cn(
              'rounded-full object-cover flex-shrink-0',
              isCollapsed ? 'w-10 h-10' : 'w-9 h-9',
            )}
          />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-sm font-medium text-white/90 truncate">
                  {currentUser.fullName}
                </span>
                {currentUser.username && (
                  <span className="text-xs text-white/40 truncate">
                    @{currentUser.username}
                  </span>
                )}
              </div>
              <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" />
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align={isCollapsed ? 'center' : 'start'}
          sideOffset={8}
          className="z-50 min-w-[200px] rounded-xl border border-white/10 bg-[#2d1f33] p-1.5 shadow-xl animate-scale-in origin-bottom"
        >
          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/8 hover:text-white cursor-pointer outline-none transition-colors"
            onSelect={() =>
              navigate({
                to: '/profile/$userId',
                params: { userId: currentUser._id },
              })
            }
          >
            <User className="w-4 h-4" />
            View Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/8 hover:text-white cursor-pointer outline-none transition-colors"
            onSelect={() =>
              navigate({
                to: '/profile/$userId/settings',
                params: { userId: currentUser._id },
              })
            }
          >
            <Settings className="w-4 h-4" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/8 hover:text-white cursor-pointer outline-none transition-colors"
            onSelect={() => navigate({ to: '/bookings' })}
          >
            <Calendar className="w-4 h-4" />
            My Bookings
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-white/8" />

          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer outline-none transition-colors"
            onSelect={() => signOut()}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

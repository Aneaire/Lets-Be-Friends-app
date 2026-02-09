import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { Bell, Heart, MessageCircle, CheckCheck, Reply } from 'lucide-react'
import { Button } from '../components/ui/button'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/notifications')({
  component: withOnboardingComplete(Notifications),
})

function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Notifications() {
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const notifications = useConvexQuery(
    api.notifications.listNotifications,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  )
  const markAllAsRead = useConvexMutation(api.notifications.markAllAsRead)

  const hasUnread = notifications?.some((n) => !n.isRead)

  const handleMarkAllAsRead = () => {
    if (currentUser?._id) {
      void markAllAsRead({ userId: currentUser._id })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm mt-1">Stay updated on your activity</p>
          </div>
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-2 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {!notifications ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card-elevated rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-foreground/10 rounded w-3/4" />
                      <div className="h-3 bg-foreground/10 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="card-warm rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                When someone interacts with your posts or comments, you'll see it here
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function NotificationItem({
  notification,
  index,
}: {
  notification: {
    _id: Id<'notifications'>
    actorId: Id<'users'>
    type: string
    postId?: Id<'posts'>
    commentId?: Id<'comments'>
    bookingId?: Id<'bookings'>
    isRead: boolean
    createdAt: number
  }
  index: number
}) {
  const navigate = useNavigate()
  const actor = useConvexQuery(api.users.getUserById, { userId: notification.actorId })
  const markAsRead = useConvexMutation(api.notifications.markAsRead)

  const actorName = actor?.fullName ?? 'Someone'

  const getNotificationText = () => {
    switch (notification.type) {
      case 'comment':
        return `${actorName} commented on your post`
      case 'comment_reply':
        return `${actorName} replied to your comment`
      case 'comment_like':
        return `${actorName} liked your comment`
      default:
        return `${actorName} interacted with you`
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-secondary" />
      case 'comment_reply':
        return <Reply className="h-4 w-4 text-primary" />
      case 'comment_like':
        return <Heart className="h-4 w-4 text-accent" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleClick = () => {
    if (!notification.isRead) {
      void markAsRead({ notificationId: notification._id })
    }
    if (notification.postId) {
      void navigate({ to: '/post/$postId', params: { postId: notification.postId as string } })
    } else if (notification.bookingId) {
      void navigate({ to: '/bookings' })
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left card-elevated rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer animate-fade-up ${
        !notification.isRead ? 'bg-primary/5' : ''
      }`}
      style={{ animationDelay: `${0.15 + index * 0.05}s`, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={actor?.avatarUrl || '/profile-placeholder.svg'}
            alt={actorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-card flex items-center justify-center">
            {getIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
            {getNotificationText()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getRelativeTime(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
        )}
      </div>
    </button>
  )
}

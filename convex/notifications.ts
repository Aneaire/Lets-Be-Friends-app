import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createNotification = mutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    actorId: v.id('users'),
    postId: v.optional(v.id('posts')),
    commentId: v.optional(v.id('comments')),
    bookingId: v.optional(v.id('bookings')),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('notifications', {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    })

    return notificationId
  },
})

export const listNotifications = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(args.limit ?? 20)

    return notifications
  },
})

export const markAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    })
  },
})

export const markAllAsRead = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()

    for (const notification of notifications) {
      if (!notification.isRead) {
        await ctx.db.patch(notification._id, {
          isRead: true,
        })
      }
    }
  },
})

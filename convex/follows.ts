import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const followUser = mutation({
  args: {
    followerId: v.id('users'),
    followingId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const existingFollow = await ctx.db
      .query('follows')
      .withIndex('by_follower', (q) =>
        q.eq('followerId', args.followerId)
      )
      .filter((q) => q.eq(q.field('followingId'), args.followingId))
      .first()

    if (existingFollow) {
      return { followed: false }
    }

    await ctx.db.insert('follows', {
      followerId: args.followerId,
      followingId: args.followingId,
      createdAt: Date.now(),
    })

    await ctx.db.insert('notifications', {
      userId: args.followingId,
      type: 'follow',
      actorId: args.followerId,
      isRead: false,
      createdAt: Date.now(),
    })

    return { followed: true }
  },
})

export const unfollowUser = mutation({
  args: {
    followerId: v.id('users'),
    followingId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const existingFollow = await ctx.db
      .query('follows')
      .withIndex('by_follower', (q) =>
        q.eq('followerId', args.followerId)
      )
      .filter((q) => q.eq(q.field('followingId'), args.followingId))
      .first()

    if (!existingFollow) {
      return { unfollowed: false }
    }

    await ctx.db.delete(existingFollow._id)

    return { unfollowed: true }
  },
})

export const listFollowers = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query('follows')
      .withIndex('by_following', (q) => q.eq('followingId', args.userId))
      .collect()

    const followerIds = follows.map((follow) => follow.followerId)

    const followers = await Promise.all(
      followerIds.map((id) => ctx.db.get(id)),
    )

    return followers.filter((user) => user !== null)
  },
})

export const listFollowing = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query('follows')
      .withIndex('by_follower', (q) => q.eq('followerId', args.userId))
      .collect()

    const followingIds = follows.map((follow) => follow.followingId)

    const following = await Promise.all(
      followingIds.map((id) => ctx.db.get(id)),
    )

    return following.filter((user) => user !== null)
  },
})

export const isFollowing = query({
  args: {
    followerId: v.id('users'),
    followingId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query('follows')
      .withIndex('by_follower', (q) =>
        q.eq('followerId', args.followerId)
      )
      .filter((q) => q.eq(q.field('followingId'), args.followingId))
      .first()

    return follow !== null
  },
})

export const getFollowCount = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query('follows')
      .withIndex('by_following', (q) => q.eq('followingId', args.userId))
      .collect()

    const following = await ctx.db
      .query('follows')
      .withIndex('by_follower', (q) => q.eq('followerId', args.userId))
      .collect()

    return {
      followers: followers.length,
      following: following.length,
    }
  },
})

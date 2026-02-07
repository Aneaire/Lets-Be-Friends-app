import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existingUser) {
      return existingUser._id
    }

    const userId = await ctx.db.insert('users', {
      ...args,
      isLocationVisible: false,
      isVerified: false,
      isOnboardingComplete: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return userId
  },
})

export const getCurrentUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    return user
  },
})

export const updateUserProfile = mutation({
  args: {
    clerkId: v.string(),
    fullName: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    birthday: v.optional(v.string()),
    gender: v.optional(v.string()),
    location: v.optional(v.string()),
    isLocationVisible: v.optional(v.boolean()),
    isOnboardingComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const { clerkId: _, ...updates } = args

    await ctx.db.patch(user._id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()

    return user
  },
})

export const getUserById = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    return user
  },
})

export const updateUserLocation = mutation({
  args: {
    clerkId: v.string(),
    locationLat: v.number(),
    locationLng: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      locationLat: args.locationLat,
      locationLng: args.locationLng,
      updatedAt: Date.now(),
    })
  },
})

export const listUsersNearby = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radius: v.number(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query('users')
      .withIndex('by_location')
      .collect()

    const nearbyUsers = users
      .filter((user) => {
        if (!user.locationLat || !user.locationLng || !user.isLocationVisible) {
          return false
        }
        return true
      })
      .map((user) => {
        const distance = calculateDistance(
          args.lat,
          args.lng,
          user.locationLat!,
          user.locationLng!,
        )
        return { ...user, distance }
      })
      .filter((user) => user.distance <= args.radius)
      .sort((a, b) => a.distance - b.distance)

    return nearbyUsers
  },
})

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

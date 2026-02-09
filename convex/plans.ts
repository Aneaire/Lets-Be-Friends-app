import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const PLAN_LIMITS: Record<string, number> = {
  lite: 5,
  medium: 17,
  premium: 55,
}

export const getUserPlan = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query('userPlans')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!plan) {
      return { plan: 'lite', maxPages: PLAN_LIMITS.lite }
    }

    return { plan: plan.plan, maxPages: plan.maxPages }
  },
})

export const setUserPlan = mutation({
  args: {
    userId: v.id('users'),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const maxPages = PLAN_LIMITS[args.plan]
    if (!maxPages) {
      throw new Error(`Invalid plan: ${args.plan}`)
    }

    const existing = await ctx.db
      .query('userPlans')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        maxPages,
        updatedAt: Date.now(),
      })
      return existing._id
    }

    return await ctx.db.insert('userPlans', {
      userId: args.userId,
      plan: args.plan,
      maxPages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const canAddPage = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query('userPlans')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    const maxPages = plan ? plan.maxPages : PLAN_LIMITS.lite

    const site = await ctx.db
      .query('userSites')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!site) return { canAdd: true, currentCount: 0, maxPages }

    const pages = await ctx.db
      .query('sitePages')
      .withIndex('by_site', (q) => q.eq('siteId', site._id))
      .collect()

    return {
      canAdd: pages.length < maxPages,
      currentCount: pages.length,
      maxPages,
    }
  },
})

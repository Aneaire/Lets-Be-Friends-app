import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const completeOnboarding = mutation({
  args: {
    clerkId: v.string(),
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
      isOnboardingComplete: true,
      updatedAt: Date.now(),
    })
  },
})

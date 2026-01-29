import { internalMutation } from './_generated/server'

export const markAllUsersOnboardingComplete = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()

    let completedCount = 0
    for (const user of users) {
      await ctx.db.patch(user._id, {
        isOnboardingComplete: true,
        updatedAt: Date.now(),
      })
      completedCount++
    }

    return { completedCount, totalUsers: users.length }
  },
})

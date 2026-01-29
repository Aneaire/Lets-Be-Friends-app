import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const generateUploadUrlDirect = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getStorageUrl = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (_, args) => {
    const convexUrl = process.env.CONVEX_SITE_URL || 'https://beloved-chihuahua-177.convex.cloud'
    return `${convexUrl}/api/storage/${args.storageId}`
  },
})

import { mutation } from './_generated/server'

export const testGenerateUploadUrl = mutation({
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl()
    console.log('Server generated URL:', url)
    return url
  },
})

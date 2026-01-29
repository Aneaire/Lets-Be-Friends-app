import { mutation, query, httpAction } from './_generated/server'
import { v } from 'convex/values'

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl()
    console.log('Generated upload URL:', url)
    return url
  },
})

export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    if (!args.storageId) return null
    return await ctx.storage.getUrl(args.storageId)
  },
})

export const serveImage = httpAction(async (ctx, request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  const { searchParams } = new URL(request.url)
  const storageId = searchParams.get('storageId')

  if (!storageId) {
    return new Response('Missing storageId', { status: 400 })
  }

  const image = await ctx.storage.get(storageId)
  if (!image) {
    return new Response('Image not found', { status: 404 })
  }

  return new Response(image, {
    headers: {
      'Content-Type': image.type || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
})

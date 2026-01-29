import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createPost = mutation({
  args: {
    userId: v.id('users'),
    caption: v.string(),
    images: v.array(v.string()),
    tags: v.array(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert('posts', {
      ...args,
      likesCount: 0,
      commentsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return postId
  },
})

export const listPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_created_at')
      .order('desc')
      .take(args.limit ?? 20)

    return posts
  },
})

export const listPostsByUser = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()

    return posts
  },
})

export const getPost = query({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)

    return post
  },
})

export const toggleLike = mutation({
  args: {
    userId: v.id('users'),
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const existingLike = await ctx.db
      .query('likes')
      .withIndex('by_user_post', (q) =>
        q.eq('userId', args.userId).eq('postId', args.postId),
      )
      .first()

    if (existingLike) {
      await ctx.db.delete(existingLike._id)
      const post = await ctx.db.get(args.postId)
      if (post) {
        await ctx.db.patch(post._id, {
          likesCount: Math.max(0, post.likesCount - 1),
        })
      }
      return { liked: false }
    } else {
      await ctx.db.insert('likes', {
        userId: args.userId,
        postId: args.postId,
        createdAt: Date.now(),
      })
      const post = await ctx.db.get(args.postId)
      if (post) {
        await ctx.db.patch(post._id, {
          likesCount: post.likesCount + 1,
        })
      }
      return { liked: true }
    }
  },
})

export const savePost = mutation({
  args: {
    userId: v.id('users'),
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const existingSave = await ctx.db
      .query('savedPosts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('postId'), args.postId))
      .first()

    if (existingSave) {
      await ctx.db.delete(existingSave._id)
      return { saved: false }
    } else {
      await ctx.db.insert('savedPosts', {
        userId: args.userId,
        postId: args.postId,
        createdAt: Date.now(),
      })
      return { saved: true }
    }
  },
})

export const isPostLiked = query({
  args: {
    userId: v.id('users'),
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query('likes')
      .withIndex('by_user_post', (q) =>
        q.eq('userId', args.userId).eq('postId', args.postId),
      )
      .first()

    return like !== null
  },
})

export const isPostSaved = query({
  args: {
    userId: v.id('users'),
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query('savedPosts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('postId'), args.postId))
      .first()

    return saved !== null
  },
})

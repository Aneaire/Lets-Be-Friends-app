import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createComment = mutation({
  args: {
    postId: v.id('posts'),
    userId: v.id('users'),
    parentCommentId: v.optional(v.id('comments')),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert('comments', {
      ...args,
      likesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId)
      if (parentComment) {
        await ctx.db.insert('notifications', {
          userId: parentComment.userId,
          type: 'comment_reply',
          actorId: args.userId,
          commentId: commentId,
          isRead: false,
          createdAt: Date.now(),
        })
      }
    } else {
      const post = await ctx.db.get(args.postId)
      if (post) {
        await ctx.db.insert('notifications', {
          userId: post.userId,
          type: 'comment',
          actorId: args.userId,
          postId: args.postId,
          commentId: commentId,
          isRead: false,
          createdAt: Date.now(),
        })

        await ctx.db.patch(args.postId, {
          commentsCount: post.commentsCount + 1,
        })
      }
    }

    return commentId
  },
})

export const listComments = query({
  args: {
    postId: v.id('posts'),
    parentCommentId: v.optional(v.id('comments')),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post', (q) =>
        q.eq('postId', args.postId)
      )
      .filter((q) => {
        if (args.parentCommentId === undefined) {
          return q.eq(q.field('parentCommentId'), undefined)
        }
        return q.eq(q.field('parentCommentId'), args.parentCommentId)
      })
      .collect()

    return comments
  },
})

export const getComment = query({
  args: {
    commentId: v.id('comments'),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId)

    return comment
  },
})

export const toggleLike = mutation({
  args: {
    userId: v.id('users'),
    commentId: v.id('comments'),
  },
  handler: async (ctx, args) => {
    const existingLike = await ctx.db
      .query('likes')
      .withIndex('by_user_comment', (q) =>
        q.eq('userId', args.userId).eq('commentId', args.commentId),
      )
      .first()

    if (existingLike) {
      await ctx.db.delete(existingLike._id)
      const comment = await ctx.db.get(args.commentId)
      if (comment) {
        await ctx.db.patch(comment._id, {
          likesCount: Math.max(0, comment.likesCount - 1),
        })
      }
      return { liked: false }
    } else {
      await ctx.db.insert('likes', {
        userId: args.userId,
        commentId: args.commentId,
        createdAt: Date.now(),
      })
      const comment = await ctx.db.get(args.commentId)
      if (comment) {
        await ctx.db.patch(comment._id, {
          likesCount: comment.likesCount + 1,
        })

        await ctx.db.insert('notifications', {
          userId: comment.userId,
          type: 'comment_like',
          actorId: args.userId,
          commentId: args.commentId,
          isRead: false,
          createdAt: Date.now(),
        })
      }

      return { liked: true }
    }
  },
})

export const isCommentLiked = query({
  args: {
    userId: v.id('users'),
    commentId: v.id('comments'),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query('likes')
      .withIndex('by_user_comment', (q) =>
        q.eq('userId', args.userId).eq('commentId', args.commentId),
      )
      .first()

    return like !== null
  },
})

import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getOrCreateConversation = mutation({
  args: {
    userId1: v.id('users'),
    userId2: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check for existing conversation between these two users
    const conversations = await ctx.db.query('conversations').collect()

    const existing = conversations.find((conv) => {
      const p = conv.participants
      return (
        p.length === 2 &&
        p.includes(args.userId1) &&
        p.includes(args.userId2)
      )
    })

    if (existing) {
      return existing._id
    }

    // Create new conversation
    const conversationId = await ctx.db.insert('conversations', {
      participants: [args.userId1, args.userId2],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return conversationId
  },
})

export const listConversations = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .collect()

    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(args.userId),
    )

    return userConversations
  },
})

export const getConversation = query({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)
    return conversation
  },
})

export const getMessagesForConversation = query({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .order('asc')
      .collect()

    return messages
  },
})

export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    senderId: v.id('users'),
    content: v.optional(v.string()),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('messages', {
      ...args,
      readBy: [args.senderId],
      createdAt: Date.now(),
    })

    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content || '[Image]',
      lastMessageAt: Date.now(),
      lastMessageBy: args.senderId,
      updatedAt: Date.now(),
    })

    return messageId
  },
})

export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id('conversations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .collect()

    for (const message of messages) {
      if (!message.readBy.includes(args.userId)) {
        await ctx.db.patch(message._id, {
          readBy: [...message.readBy, args.userId],
        })
      }
    }
  },
})

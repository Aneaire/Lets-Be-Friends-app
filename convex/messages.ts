import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

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

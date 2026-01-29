import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createBooking = mutation({
  args: {
    bookerId: v.id('users'),
    serviceId: v.id('services'),
    ownerId: v.id('users'),
    scheduledDate: v.number(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)
    if (!service) {
      throw new Error('Service not found')
    }

    const totalPrice = service.pricePerHour * args.duration

    const bookingId = await ctx.db.insert('bookings', {
      ...args,
      totalPrice,
      status: 'pending',
      paymentLink: undefined,
      paymentId: undefined,
      receiptStart: undefined,
      receiptMiddle: undefined,
      receiptEnd: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return bookingId
  },
})

export const listBookings = query({
  args: {
    userId: v.id('users'),
    role: v.union(v.literal('booker'), v.literal('owner')),
  },
  handler: async (ctx, args) => {
    const index = args.role === 'booker' ? 'by_booker' : 'by_owner'

    const bookings = await ctx.db
      .query('bookings')
      .withIndex(index, (q) => q.eq(args.role === 'booker' ? 'bookerId' : 'ownerId', args.userId))
      .order('desc')
      .collect()

    return bookings
  },
})

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id('bookings'),
    status: v.string(),
    paymentLink: v.optional(v.string()),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      paymentLink: args.paymentLink,
      paymentId: args.paymentId,
      updatedAt: Date.now(),
    })
  },
})

export const uploadReceipt = mutation({
  args: {
    bookingId: v.id('bookings'),
    receiptType: v.union(v.literal('start'), v.literal('middle'), v.literal('end')),
    receiptUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, string> = {}
    updates[`receipt${args.receiptType.charAt(0).toUpperCase() + args.receiptType.slice(1)}`] = args.receiptUrl

    await ctx.db.patch(args.bookingId, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

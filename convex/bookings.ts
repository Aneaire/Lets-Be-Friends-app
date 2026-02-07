import { mutation, query, internalMutation } from './_generated/server'
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
      paymentStatus: 'unpaid',
      paymentLink: undefined,
      paymentId: undefined,
      paymongoLinkId: undefined,
      paidAt: undefined,
      receiptStart: undefined,
      receiptMiddle: undefined,
      receiptEnd: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return bookingId
  },
})

export const getBooking = query({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId)
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

export const acceptBooking = mutation({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }
    if (booking.status !== 'pending') {
      throw new Error('Booking is not in pending status')
    }

    await ctx.db.patch(args.bookingId, {
      status: 'accepted',
      updatedAt: Date.now(),
    })

    return booking
  },
})

export const declineBooking = mutation({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }
    if (booking.status !== 'pending') {
      throw new Error('Booking is not in pending status')
    }

    await ctx.db.patch(args.bookingId, {
      status: 'declined',
      updatedAt: Date.now(),
    })
  },
})

export const cancelBooking = mutation({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      throw new Error('Cannot cancel a completed or already cancelled booking')
    }

    await ctx.db.patch(args.bookingId, {
      status: 'cancelled',
      updatedAt: Date.now(),
    })
  },
})

export const completeBooking = mutation({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }
    if (booking.paymentStatus !== 'paid') {
      throw new Error('Cannot complete booking: payment has not been received')
    }
    if (booking.status !== 'paid') {
      throw new Error('Booking is not in paid status')
    }

    await ctx.db.patch(args.bookingId, {
      status: 'completed',
      updatedAt: Date.now(),
    })
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

export const updateBookingPayment = internalMutation({
  args: {
    bookingId: v.id('bookings'),
    paymentStatus: v.optional(v.string()),
    paymentLink: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymongoLinkId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { bookingId, ...updates } = args
    const filteredUpdates: Record<string, any> = { updatedAt: Date.now() }
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value
      }
    }
    await ctx.db.patch(bookingId, filteredUpdates)
  },
})

export const internalUpdateStatus = internalMutation({
  args: {
    bookingId: v.id('bookings'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
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

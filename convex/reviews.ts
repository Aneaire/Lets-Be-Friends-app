import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createReview = mutation({
  args: {
    bookingId: v.id('bookings'),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(),
    caption: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existingReview = await ctx.db
      .query('reviews')
      .withIndex('by_booking', (q) => q.eq('bookingId', args.bookingId))
      .first()

    if (existingReview) {
      throw new Error('Review already exists for this booking')
    }

    const reviewId = await ctx.db.insert('reviews', {
      ...args,
      likesCount: 0,
      createdAt: Date.now(),
    })

    return reviewId
  },
})

export const getReview = query({
  args: {
    reviewId: v.id('reviews'),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId)

    return review
  },
})

export const listReviewsByUser = query({
  args: {
    revieweeId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', args.revieweeId))
      .collect()

    return reviews
  },
})

export const listReviewsByBooking = query({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_booking', (q) => q.eq('bookingId', args.bookingId))
      .collect()

    return reviews
  },
})

export const getAverageRating = query({
  args: {
    revieweeId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_reviewee', (q) => q.eq('revieweeId', args.revieweeId))
      .collect()

    if (reviews.length === 0) {
      return { rating: 0, count: 0 }
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0)

    return {
      rating: total / reviews.length,
      count: reviews.length,
    }
  },
})



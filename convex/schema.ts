import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.optional(v.string()),
    email: v.string(),
    fullName: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    birthday: v.optional(v.string()),
    gender: v.optional(v.string()),
    location: v.optional(v.string()),
    locationLat: v.optional(v.number()),
    locationLng: v.optional(v.number()),
    isLocationVisible: v.boolean(),
    isVerified: v.boolean(),
    isOnboardingComplete: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_username', ['username'])
    .index('by_location', ['location']),

  posts: defineTable({
    userId: v.id('users'),
    caption: v.string(),
    images: v.array(v.string()),
    tags: v.array(v.string()),
    location: v.optional(v.string()),
    likesCount: v.number(),
    commentsCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_created_at', ['createdAt'])
    .index('by_location', ['location']),

  comments: defineTable({
    postId: v.id('posts'),
    userId: v.id('users'),
    parentCommentId: v.optional(v.id('comments')),
    content: v.string(),
    likesCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_post', ['postId'])
    .index('by_user', ['userId'])
    .index('by_parent', ['parentCommentId']),

  likes: defineTable({
    userId: v.id('users'),
    postId: v.optional(v.id('posts')),
    commentId: v.optional(v.id('comments')),
    createdAt: v.number(),
  })
    .index('by_user_post', ['userId', 'postId'])
    .index('by_user_comment', ['userId', 'commentId'])
    .index('by_post', ['postId']),

  follows: defineTable({
    followerId: v.id('users'),
    followingId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_follower', ['followerId'])
    .index('by_following', ['followingId']),

  services: defineTable({
    userId: v.id('users'),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    pricePerHour: v.number(),
    availability: v.array(v.string()),
    location: v.string(),
    tags: v.array(v.string()),
    images: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_category', ['category'])
    .index('by_location', ['location'])
    .index('by_active', ['isActive']),

  bookings: defineTable({
    bookerId: v.id('users'),
    serviceId: v.id('services'),
    ownerId: v.id('users'),
    scheduledDate: v.number(),
    duration: v.number(),
    totalPrice: v.number(),
    notes: v.optional(v.string()),
    status: v.string(),
    paymentStatus: v.optional(v.string()),
    paymentLink: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymongoLinkId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    receiptStart: v.optional(v.string()),
    receiptMiddle: v.optional(v.string()),
    receiptEnd: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_booker', ['bookerId'])
    .index('by_owner', ['ownerId'])
    .index('by_service', ['serviceId'])
    .index('by_status', ['status'])
    .index('by_payment_status', ['paymentStatus']),

  conversations: defineTable({
    participants: v.array(v.id('users')),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    lastMessageBy: v.optional(v.id('users')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_participants', ['participants']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    senderId: v.id('users'),
    content: v.optional(v.string()),
    images: v.array(v.string()),
    readBy: v.array(v.id('users')),
    createdAt: v.number(),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_sender', ['senderId']),

  reviews: defineTable({
    bookingId: v.id('bookings'),
    reviewerId: v.id('users'),
    revieweeId: v.id('users'),
    rating: v.number(),
    caption: v.string(),
    images: v.array(v.string()),
    likesCount: v.number(),
    createdAt: v.number(),
  })
    .index('by_booking', ['bookingId'])
    .index('by_reviewer', ['reviewerId'])
    .index('by_reviewee', ['revieweeId']),

  notifications: defineTable({
    userId: v.id('users'),
    type: v.string(),
    actorId: v.id('users'),
    postId: v.optional(v.id('posts')),
    commentId: v.optional(v.id('comments')),
    bookingId: v.optional(v.id('bookings')),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_read', ['isRead'])
    .index('by_type', ['type']),

  savedPosts: defineTable({
    userId: v.id('users'),
    postId: v.id('posts'),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_post', ['postId']),

  locations: defineTable({
    name: v.string(),
    province: v.string(),
    region: v.string(),
    lat: v.number(),
    lng: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_province', ['province'])
    .index('by_region', ['region']),

  userPlans: defineTable({
    userId: v.id('users'),
    plan: v.string(),
    maxPages: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId']),

  userSites: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId']),

  sitePages: defineTable({
    siteId: v.id('userSites'),
    userId: v.id('users'),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    pageOrder: v.number(),
    isHomePage: v.boolean(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_site', ['siteId'])
    .index('by_user', ['userId'])
    .index('by_slug', ['siteId', 'slug']),
})

import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { PLAN_LIMITS } from './plans'

// ─── Site CRUD ───

export const createSite = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userSites')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (existing) {
      throw new Error('User already has a site. Only one site per user.')
    }

    return await ctx.db.insert('userSites', {
      userId: args.userId,
      name: args.name,
      description: args.description,
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const getSite = query({
  args: {
    siteId: v.id('userSites'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.siteId)
  },
})

export const getUserSite = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('userSites')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()
  },
})

export const updateSite = mutation({
  args: {
    siteId: v.id('userSites'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { siteId, ...updates } = args
    await ctx.db.patch(siteId, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

// ─── Page CRUD ───

export const createPage = mutation({
  args: {
    siteId: v.id('userSites'),
    userId: v.id('users'),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    pageOrder: v.number(),
    isHomePage: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Enforce plan limit
    const plan = await ctx.db
      .query('userPlans')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    const maxPages = plan ? plan.maxPages : PLAN_LIMITS.lite

    const existingPages = await ctx.db
      .query('sitePages')
      .withIndex('by_site', (q) => q.eq('siteId', args.siteId))
      .collect()

    if (existingPages.length >= maxPages) {
      throw new Error(
        `Page limit reached. Your ${plan?.plan ?? 'lite'} plan allows ${maxPages} pages. Upgrade to add more.`
      )
    }

    // If this is set as homepage, unset any existing homepage
    if (args.isHomePage) {
      for (const page of existingPages) {
        if (page.isHomePage) {
          await ctx.db.patch(page._id, { isHomePage: false })
        }
      }
    }

    return await ctx.db.insert('sitePages', {
      siteId: args.siteId,
      userId: args.userId,
      title: args.title,
      slug: args.slug,
      content: args.content,
      pageOrder: args.pageOrder,
      isHomePage: args.isHomePage,
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const updatePage = mutation({
  args: {
    pageId: v.id('sitePages'),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    pageOrder: v.optional(v.number()),
    isHomePage: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { pageId, ...updates } = args

    // If setting as homepage, unset others
    if (updates.isHomePage) {
      const page = await ctx.db.get(pageId)
      if (page) {
        const siblings = await ctx.db
          .query('sitePages')
          .withIndex('by_site', (q) => q.eq('siteId', page.siteId))
          .collect()

        for (const sibling of siblings) {
          if (sibling._id !== pageId && sibling.isHomePage) {
            await ctx.db.patch(sibling._id, { isHomePage: false })
          }
        }
      }
    }

    await ctx.db.patch(pageId, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

export const deletePage = mutation({
  args: {
    pageId: v.id('sitePages'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.pageId)
  },
})

export const getPage = query({
  args: {
    pageId: v.id('sitePages'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.pageId)
  },
})

export const listPages = query({
  args: {
    siteId: v.id('userSites'),
  },
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query('sitePages')
      .withIndex('by_site', (q) => q.eq('siteId', args.siteId))
      .collect()

    return pages.sort((a, b) => a.pageOrder - b.pageOrder)
  },
})

export const getPageCount = query({
  args: {
    siteId: v.id('userSites'),
  },
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query('sitePages')
      .withIndex('by_site', (q) => q.eq('siteId', args.siteId))
      .collect()

    return pages.length
  },
})

export const publishSite = mutation({
  args: {
    siteId: v.id('userSites'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.siteId, {
      isPublished: true,
      updatedAt: Date.now(),
    })

    const pages = await ctx.db
      .query('sitePages')
      .withIndex('by_site', (q) => q.eq('siteId', args.siteId))
      .collect()

    for (const page of pages) {
      await ctx.db.patch(page._id, {
        isPublished: true,
        updatedAt: Date.now(),
      })
    }
  },
})

export const reorderPages = mutation({
  args: {
    pages: v.array(
      v.object({
        pageId: v.id('sitePages'),
        pageOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const { pageId, pageOrder } of args.pages) {
      await ctx.db.patch(pageId, {
        pageOrder,
        updatedAt: Date.now(),
      })
    }
  },
})

// ─── Public queries for site viewing ───

export const getPublicSite = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query('userSites')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!site || !site.isPublished) return null

    const pages = await ctx.db
      .query('sitePages')
      .withIndex('by_site', (q) => q.eq('siteId', site._id))
      .collect()

    const publishedPages = pages
      .filter((p) => p.isPublished)
      .sort((a, b) => a.pageOrder - b.pageOrder)

    return { site, pages: publishedPages }
  },
})

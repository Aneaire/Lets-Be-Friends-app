import { query } from './_generated/server'
import { v } from 'convex/values'

interface Post {
  caption: string
  tags: string[]
}

interface Service {
  title: string
  description: string
  tags: string[]
  category: string
  location: string
}

interface User {
  username?: string | null
  fullName: string
  bio?: string | null
}

export const searchPosts = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_created_at')
      .order('desc')
      .take(args.limit ?? 50)

    const term = args.searchTerm.toLowerCase()

    const filtered = posts.filter((post: Post) => {
      const caption = post.caption.toLowerCase()
      const tags = post.tags.map((tag: string) => tag.toLowerCase())

      return (
        caption.includes(term) ||
        tags.some((tag: string) => tag.includes(term))
      )
    })

    return filtered
  },
})

export const searchServices = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const servicesQuery = ctx.db.query('services')

    const term = args.searchTerm.toLowerCase()

    const services = await servicesQuery.collect()

    const filtered = services.filter((service: Service) => {
      const title = service.title.toLowerCase()
      const description = service.description.toLowerCase()
      const tags = service.tags.map((tag: string) => tag.toLowerCase())

      const matchesSearch =
        title.includes(term) ||
        description.includes(term) ||
        tags.some((tag: string) => tag.includes(term))

      const matchesCategory = !args.category || service.category === args.category

      const matchesLocation = !args.location || service.location.includes(args.location)

      return matchesSearch && matchesCategory && matchesLocation
    })

    return filtered.slice(0, args.limit ?? 50)
  },
})

export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query('users')
      .collect()

    const term = args.searchTerm.toLowerCase()

    const filtered = users.filter((user: User) => {
      const username = user.username?.toLowerCase() ?? ''
      const fullName = user.fullName.toLowerCase()
      const bio = user.bio?.toLowerCase() ?? ''

      return (
        username.includes(term) ||
        fullName.includes(term) ||
        bio.includes(term)
      )
    })

    return filtered.slice(0, args.limit ?? 50)
  },
})

export const getLocationBasedServices = query({
  args: {
    location: v.string(),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query('services')
      .collect()

    const nearbyServices = services.filter((service: Service) => {
      const matchesCategory = !args.category || service.category === args.category
      const matchesLocation = !args.location || service.location.includes(args.location)

      return matchesCategory && matchesLocation
    })

    return nearbyServices.slice(0, args.limit ?? 50)
  },
})

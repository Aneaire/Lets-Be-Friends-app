import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { calculateDistance } from './users'

interface Service {
  isActive: boolean
  category: string
  location: string
}

export const createService = mutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    pricePerHour: v.number(),
    availability: v.array(v.string()),
    location: v.string(),
    tags: v.array(v.string()),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const serviceId = await ctx.db.insert('services', {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return serviceId
  },
})

export const listServices = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db.query('services').collect()

    const filtered = services.filter((service: Service) => {
      const isActive = service.isActive === true
      const matchesCategory = !args.category || service.category === args.category
      const matchesLocation = !args.location || service.location.includes(args.location)

      return isActive && matchesCategory && matchesLocation
    })

    return filtered.slice(0, args.limit ?? 20)
  },
})

export const getService = query({
  args: {
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)

    return service
  },
})

export const listServicesByUser = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query('services')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()

    return services
  },
})

export const listServicesNearby = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radius: v.number(),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query('services')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()

    const servicesWithDistance = await Promise.all(
      services.map(async (service) => {
        const owner = await ctx.db.get(service.userId)
        if (!owner || !owner.locationLat || !owner.locationLng || !owner.isLocationVisible) {
          return null
        }
        const distance = calculateDistance(
          args.lat,
          args.lng,
          owner.locationLat,
          owner.locationLng,
        )
        if (distance > args.radius) return null
        return { ...service, distance, ownerName: owner.fullName, ownerAvatar: owner.avatarUrl }
      }),
    )

    return servicesWithDistance
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => a.distance - b.distance)
  },
})

export const updateService = mutation({
  args: {
    serviceId: v.id('services'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    pricePerHour: v.optional(v.number()),
    availability: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { serviceId, ...updates } = args

    await ctx.db.patch(serviceId, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

import { query } from './_generated/server'
import { v } from 'convex/values'

interface Location {
  name: string
  province: string
  region: string
}

export const listLocations = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db.query('locations').collect()

    return locations
  },
})

export const getLocationByProvince = query({
  args: {
    province: v.string(),
  },
  handler: async (ctx, args) => {
    const locations = await ctx.db
      .query('locations')
      .withIndex('by_province', (q) => q.eq('province', args.province))
      .collect()

    return locations
  },
})

export const searchLocations = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const locations = await ctx.db.query('locations').collect()

    const term = args.searchTerm.toLowerCase()

    const filtered = locations.filter((location: Location) => {
      const name = location.name.toLowerCase()
      const province = location.province.toLowerCase()
      const region = location.region.toLowerCase()

      return (
        name.includes(term) ??
        province.includes(term) ??
        region.includes(term)
      )
    })

    return filtered
  },
})

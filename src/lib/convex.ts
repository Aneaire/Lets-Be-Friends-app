import { ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? 'https://beloved-chihuahua-177.convex.cloud'

console.log('Using Convex URL:', convexUrl)

const convex = new ConvexReactClient(convexUrl)

export default convex

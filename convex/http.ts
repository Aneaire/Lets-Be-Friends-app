import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

http.route({
  path: '/paymongo-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const body = await request.json()

    const event = body?.data
    if (!event) {
      return new Response('Invalid webhook payload', { status: 400 })
    }

    const eventType = event.attributes?.type
    const resource = event.attributes?.data

    if (!eventType || !resource) {
      return new Response('Missing event type or resource data', { status: 400 })
    }

    await ctx.runAction(internal.paymongo.processWebhookEvent, {
      eventType,
      resourceId: resource.id,
      resourceAttributes: resource.attributes,
    })

    return new Response('OK', { status: 200 })
  }),
})

export default http

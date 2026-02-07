"use node"

import { action, internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1'

function getAuthHeader() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY
  if (!secretKey) {
    throw new Error('PAYMONGO_SECRET_KEY environment variable is not set')
  }
  return 'Basic ' + Buffer.from(secretKey + ':').toString('base64')
}

export const createPaymentLink = action({
  args: {
    bookingId: v.id('bookings'),
    amount: v.number(),
    description: v.string(),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const amountInCentavos = Math.round(args.amount * 100)

    const response = await fetch(`${PAYMONGO_BASE_URL}/links`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            description: args.description,
            remarks: args.remarks ?? `Booking ${args.bookingId}`,
          },
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`PayMongo API error (${response.status}): ${errorBody}`)
    }

    const data = await response.json()
    const link = data.data

    await ctx.runMutation(internal.bookings.updateBookingPayment, {
      bookingId: args.bookingId,
      paymentLink: link.attributes.checkout_url,
      paymongoLinkId: link.id,
      paymentStatus: 'unpaid',
    })

    return {
      checkoutUrl: link.attributes.checkout_url,
      linkId: link.id,
    }
  },
})

export const getPaymentStatus = action({
  args: {
    paymongoLinkId: v.string(),
  },
  handler: async (_ctx, args) => {
    const response = await fetch(`${PAYMONGO_BASE_URL}/links/${args.paymongoLinkId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': getAuthHeader(),
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`PayMongo API error (${response.status}): ${errorBody}`)
    }

    const data = await response.json()
    const linkData = data.data

    return {
      status: linkData.attributes.status,
      payments: linkData.attributes.payments,
    }
  },
})

export const processWebhookEvent = internalAction({
  args: {
    eventType: v.string(),
    resourceId: v.string(),
    resourceAttributes: v.any(),
  },
  handler: async (ctx, args) => {
    const { eventType, resourceAttributes } = args

    if (eventType === 'link.payment.paid') {
      const description = resourceAttributes?.description ?? ''
      const remarks = resourceAttributes?.remarks ?? ''

      const bookingIdMatch = remarks.match(/Booking (.+)/) ?? description.match(/Booking (.+)/)
      if (!bookingIdMatch) {
        console.error('Could not extract booking ID from webhook payload')
        return
      }

      const bookingId = bookingIdMatch[1].trim()

      await ctx.runMutation(internal.bookings.updateBookingPayment, {
        bookingId: bookingId as any,
        paymentStatus: 'paid',
        paymentId: args.resourceId,
        paidAt: Date.now(),
      })

      await ctx.runMutation(internal.bookings.internalUpdateStatus, {
        bookingId: bookingId as any,
        status: 'paid',
      })
    }

    if (eventType === 'link.payment.failed') {
      const remarks = resourceAttributes?.remarks ?? ''
      const description = resourceAttributes?.description ?? ''
      const bookingIdMatch = remarks.match(/Booking (.+)/) ?? description.match(/Booking (.+)/)
      if (!bookingIdMatch) {
        console.error('Could not extract booking ID from failed payment webhook')
        return
      }

      const bookingId = bookingIdMatch[1].trim()

      await ctx.runMutation(internal.bookings.updateBookingPayment, {
        bookingId: bookingId as any,
        paymentStatus: 'failed',
      })
    }
  },
})

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { Calendar, Clock, DollarSign, FileText, CheckCircle, XCircle, AlertCircle, MoreHorizontal } from 'lucide-react'
import type { Doc } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/bookings')({
  component: withOnboardingComplete(Bookings),
})

function Bookings() {
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const [activeTab, setActiveTab] = useState<'my' | 'service'>('my')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all')

  const myBookings = useConvexQuery(api.bookings.listBookings, {
    userId: currentUser?._id ?? ('' as any),
    role: 'booker',
  })

  const serviceBookings = useConvexQuery(api.bookings.listBookings, {
    userId: currentUser?._id ?? ('' as any),
    role: 'owner',
  })

  const updateStatus = useConvexMutation(api.bookings.updateBookingStatus)
  const uploadReceipt = useConvexMutation(api.bookings.uploadReceipt)

  const bookings = activeTab === 'my' ? myBookings : serviceBookings

  const filteredBookings = bookings?.filter((booking) => {
    if (statusFilter === 'all') return true
    return booking.status === statusFilter
  }) ?? []

  const handleStatusUpdate = (bookingId: string, status: string, paymentLink?: string) => {
    void updateStatus({ bookingId: bookingId as any, status, paymentLink })
  }

  const handleUploadReceipt = (bookingId: string, receiptType: 'start' | 'middle' | 'end', url: string) => {
    void uploadReceipt({ bookingId: bookingId as any, receiptType, receiptUrl: url })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: AlertCircle },
      accepted: { color: 'bg-blue-100 text-blue-800', label: 'Accepted', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircle },
    }

    const config = statusConfig[status] ?? statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bookings</h1>

        <div className="mb-6 border-b">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`pb-4 font-medium transition-colors ${
                activeTab === 'my'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`pb-4 font-medium transition-colors ${
                activeTab === 'service'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Service Bookings
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <p className="text-muted-foreground">No {statusFilter === 'all' ? '' : `${statusFilter} `}bookings found.</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                activeTab={activeTab}
                onStatusUpdate={handleStatusUpdate}
                onUploadReceipt={handleUploadReceipt}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface BookingCardProps {
  booking: Doc<'bookings'>
  activeTab: 'my' | 'service'
  onStatusUpdate: (bookingId: string, status: string, paymentLink?: string) => void
  onUploadReceipt: (bookingId: string, receiptType: 'start' | 'middle' | 'end', url: string) => void
  getStatusBadge: (status: string) => React.ReactNode
}

function BookingCard({ booking, activeTab, onStatusUpdate, onUploadReceipt, getStatusBadge }: BookingCardProps) {
  const [showActions, setShowActions] = useState(false)

  const isOwner = activeTab === 'service'
  const isPending = booking.status === 'pending'
  const isAccepted = booking.status === 'accepted'
  const isCompleted = booking.status === 'completed'

  return (
    <div className="bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(booking.status)}
                <span className="text-sm text-muted-foreground">
                  Booking {booking._id.substring(0, 8)}...
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {isOwner ? 'Booking for Service' : 'Your Booking'}
              </h3>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-muted rounded"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-card border rounded-md shadow-lg p-1 min-w-[150px] z-10">
                  {isPending && isOwner && (
                    <>
                      <button
                        onClick={() => {
                          onStatusUpdate(booking._id, 'accepted')
                          setShowActions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          onStatusUpdate(booking._id, 'cancelled')
                          setShowActions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {isPending && !isOwner && (
                    <button
                      onClick={() => {
                        onStatusUpdate(booking._id, 'cancelled')
                        setShowActions(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-red-600"
                    >
                      Cancel
                    </button>
                  )}
                  {isCompleted && !booking.paymentLink && isOwner && (
                    <button
                      onClick={() => {
                        const link = `https://checkout.paymongo.com/example/${booking._id}`
                        onStatusUpdate(booking._id, 'completed', link)
                        setShowActions(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                    >
                      Send Payment Link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(booking.scheduledDate).toLocaleDateString()} at{' '}
                {new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{booking.duration} hours</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">₱{booking.totalPrice}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="text-sm">{booking.notes}</p>
            </div>
          )}

          {isCompleted && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Receipts
              </h4>
              <div className="grid sm:grid-cols-3 gap-2">
                <ReceiptButton
                  type="Start"
                  url={booking.receiptStart}
                  onUpload={(url) => onUploadReceipt(booking._id, 'start', url)}
                />
                <ReceiptButton
                  type="Middle"
                  url={booking.receiptMiddle}
                  onUpload={(url) => onUploadReceipt(booking._id, 'middle', url)}
                />
                <ReceiptButton
                  type="End"
                  url={booking.receiptEnd}
                  onUpload={(url) => onUploadReceipt(booking._id, 'end', url)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-64">
          {isAccepted && booking.paymentLink && (
            <a
              href={booking.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-primary text-primary-foreground text-center px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors mb-2"
            >
              Pay Now
            </a>
          )}
          {isCompleted && booking.paymentId && (
            <div className="text-sm text-muted-foreground mb-2">
              Payment ID: {booking.paymentId}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ReceiptButtonProps {
  type: 'Start' | 'Middle' | 'End'
  url?: string
  onUpload: (url: string) => void
}

function ReceiptButton({ type, url, onUpload }: ReceiptButtonProps) {
  return (
    <div className="border rounded-md p-3 text-center">
      <p className="text-xs text-muted-foreground mb-2">{type} Receipt</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View
        </a>
      ) : (
        <label className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          Upload
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const url = URL.createObjectURL(file)
                onUpload(url)
              }
            }}
          />
        </label>
      )}
    </div>
  )
}

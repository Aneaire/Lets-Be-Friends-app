import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { Calendar, Clock, DollarSign, FileText, CheckCircle, XCircle, AlertCircle, MoreHorizontal, CalendarDays } from 'lucide-react'
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
      pending: { color: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Pending', icon: AlertCircle },
      accepted: { color: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Accepted', icon: CheckCircle },
      completed: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Completed', icon: CheckCircle },
      cancelled: { color: 'bg-red-50 text-red-700 border border-red-200', label: 'Cancelled', icon: XCircle },
    }

    const config = statusConfig[status] ?? statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your bookings and service requests</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="flex gap-1 bg-foreground/5 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'my'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'service'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Service Bookings
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-warm text-sm py-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings List */}
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          {filteredBookings.length === 0 ? (
            <div className="card-warm rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-7 h-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">No {statusFilter === 'all' ? '' : `${statusFilter} `}bookings found</p>
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
    <div className="card-elevated rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(booking.status)}
                <span className="text-xs text-muted-foreground font-mono">
                  #{booking._id.substring(0, 8)}
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                {isOwner ? 'Booking for Service' : 'Your Booking'}
              </h3>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-foreground/5 rounded-xl transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-lg p-1 min-w-[150px] z-10">
                  {isPending && isOwner && (
                    <>
                      <button
                        onClick={() => {
                          onStatusUpdate(booking._id, 'accepted')
                          setShowActions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded-lg text-secondary font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          onStatusUpdate(booking._id, 'cancelled')
                          setShowActions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded-lg text-destructive"
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
                      className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded-lg text-destructive"
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
                      className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded-lg font-medium"
                    >
                      Send Payment Link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2.5 text-sm text-foreground/80">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span>
                {new Date(booking.scheduledDate).toLocaleDateString()} at{' '}
                {new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-foreground/80">
              <div className="w-8 h-8 rounded-lg bg-secondary/8 flex items-center justify-center">
                <Clock className="h-4 w-4 text-secondary" />
              </div>
              <span>{booking.duration} hours</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-accent" />
              </div>
              <span className="font-heading font-bold text-foreground">₱{booking.totalPrice}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="bg-foreground/3 rounded-xl p-3 mb-4">
              <p className="text-sm text-foreground/70 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {isCompleted && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
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

        <div className="lg:w-56">
          {isAccepted && booking.paymentLink && (
            <a
              href={booking.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-primary text-primary-foreground text-center px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-[0.97] mb-2"
            >
              Pay Now
            </a>
          )}
          {isCompleted && booking.paymentId && (
            <div className="text-xs text-muted-foreground font-mono mb-2">
              Payment: {booking.paymentId}
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
    <div className="border border-border rounded-xl p-3 text-center bg-card">
      <p className="text-xs text-muted-foreground mb-2 font-medium">{type} Receipt</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline font-medium"
        >
          View
        </a>
      ) : (
        <label className="text-sm text-muted-foreground hover:text-primary cursor-pointer font-medium transition-colors">
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

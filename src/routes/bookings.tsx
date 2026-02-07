import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  CalendarDays, Star, Send, X, CreditCard, FileText,
  ChevronDown, ChevronUp, Users, MapPin, ExternalLink,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import type { Doc, Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/bookings')({
  component: withOnboardingComplete(Bookings),
})

function Bookings() {
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const [activeTab, setActiveTab] = useState<'my' | 'service'>('my')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all')

  const myBookings = useConvexQuery(api.bookings.listBookings, {
    userId: currentUser?._id ?? ('' as Id<'users'>),
    role: 'booker',
  })

  const serviceBookings = useConvexQuery(api.bookings.listBookings, {
    userId: currentUser?._id ?? ('' as Id<'users'>),
    role: 'owner',
  })

  const updateStatus = useConvexMutation(api.bookings.updateBookingStatus)

  const bookings = activeTab === 'my' ? myBookings : serviceBookings

  const filteredBookings = bookings?.filter((booking) => {
    if (statusFilter === 'all') return true
    return booking.status === statusFilter
  }) ?? []

  const handleStatusUpdate = (bookingId: Id<'bookings'>, status: string, paymentLink?: string) => {
    void updateStatus({ bookingId, status, paymentLink })
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
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
              Service Requests
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-3 animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="input-warm text-sm py-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-sm text-muted-foreground">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Bookings List */}
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          {filteredBookings.length === 0 ? (
            <div className="card-warm rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-7 h-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">
                No {statusFilter === 'all' ? '' : `${statusFilter} `}bookings found
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {activeTab === 'my' ? 'Browse services to book a friend!' : 'Your service requests will appear here'}
              </p>
              {activeTab === 'my' && (
                <Link to="/discover" className="inline-block mt-4">
                  <Button size="sm" className="gap-2">
                    <Users className="h-4 w-4" />
                    Discover Services
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                isOwnerView={activeTab === 'service'}
                currentUserId={currentUser?._id}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string; Icon: typeof AlertCircle }> = {
    pending: { color: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Pending', Icon: AlertCircle },
    accepted: { color: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Accepted', Icon: CheckCircle },
    completed: { color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Completed', Icon: CheckCircle },
    cancelled: { color: 'bg-red-50 text-red-700 border border-red-200', label: 'Cancelled', Icon: XCircle },
  }

  const { color, label, Icon } = config[status] ?? config.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

// Booking Card with enriched data
function BookingCard({
  booking,
  isOwnerView,
  currentUserId,
  onStatusUpdate,
}: {
  booking: Doc<'bookings'>
  isOwnerView: boolean
  currentUserId?: Id<'users'>
  onStatusUpdate: (bookingId: Id<'bookings'>, status: string, paymentLink?: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Fetch related data
  const service = useConvexQuery(api.services.getService, { serviceId: booking.serviceId })
  const otherUserId = isOwnerView ? booking.bookerId : booking.ownerId
  const otherUser = useConvexQuery(api.users.getUserById, { userId: otherUserId })
  const existingReview = useConvexQuery(api.reviews.listReviewsByBooking, { bookingId: booking._id })

  const isPending = booking.status === 'pending'
  const isAccepted = booking.status === 'accepted'
  const isCompleted = booking.status === 'completed'
  const hasReview = existingReview && existingReview.length > 0

  return (
    <>
      <div className="card-elevated rounded-2xl overflow-hidden">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={otherUser?.avatarUrl || '/profile-placeholder.svg'}
                alt={otherUser?.fullName || 'User'}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/10"
              />
              <div>
                <Link
                  to="/profile/$userId"
                  params={{ userId: otherUserId as string }}
                  className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                >
                  {otherUser?.fullName || 'Loading...'}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {isOwnerView ? 'wants to book you' : 'service provider'}
                </p>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {/* Service Info */}
          {service && (
            <Link
              to="/service/$serviceId"
              params={{ serviceId: service._id as string }}
              className="block bg-foreground/3 rounded-xl p-3 mb-4 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {service.location}
                    </span>
                    <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                      {service.category}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-foreground text-xs">
                  {new Date(booking.scheduledDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-secondary/8 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground text-xs">{booking.duration}hr{booking.duration !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-heading font-bold text-foreground text-xs">₱{booking.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Owner actions for pending bookings */}
            {isPending && isOwnerView && (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(booking._id, 'accepted')}
                  className="gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Accept
                </Button>
                <button
                  onClick={() => onStatusUpdate(booking._id, 'cancelled')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
                >
                  Decline
                </button>
              </>
            )}

            {/* Booker cancel for pending */}
            {isPending && !isOwnerView && (
              <button
                onClick={() => onStatusUpdate(booking._id, 'cancelled')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
              >
                Cancel Booking
              </button>
            )}

            {/* Payment link for accepted bookings */}
            {isAccepted && booking.paymentLink && !isOwnerView && (
              <a
                href={booking.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Pay Now
                </Button>
              </a>
            )}

            {/* Mark complete for owner */}
            {isAccepted && isOwnerView && (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(booking._id, 'completed')}
                className="gap-1.5"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Mark Complete
              </Button>
            )}

            {/* Leave review for completed bookings */}
            {isCompleted && !hasReview && currentUserId && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <Star className="h-3.5 w-3.5" />
                Leave Review
              </button>
            )}

            {isCompleted && hasReview && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Reviewed
              </span>
            )}

            {/* Expand/collapse */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-auto px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Expanded Details */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              {booking.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground/70 bg-foreground/3 rounded-xl p-3">{booking.notes}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                <p>Booking ID: <span className="font-mono">{booking._id}</span></p>
                <p>Created: {new Date(booking.createdAt).toLocaleString('en-PH')}</p>
                {booking.paymentId && <p>Payment ID: <span className="font-mono">{booking.paymentId}</span></p>}
              </div>

              {/* Receipt section for completed bookings */}
              {isCompleted && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Receipts
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['start', 'middle', 'end'] as const).map((type) => {
                      const key = `receipt${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof Doc<'bookings'>
                      const url = booking[key] as string | undefined
                      return (
                        <div key={type} className="border border-border rounded-xl p-2.5 text-center bg-card">
                          <p className="text-[10px] text-muted-foreground mb-1.5 font-medium capitalize">{type}</p>
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-medium">
                              View
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">None</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && currentUserId && (
        <ReviewModal
          bookingId={booking._id}
          reviewerId={currentUserId}
          revieweeId={isOwnerView ? booking.bookerId : booking.ownerId}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  )
}

// Review Modal
function ReviewModal({
  bookingId,
  reviewerId,
  revieweeId,
  onClose,
}: {
  bookingId: Id<'bookings'>
  reviewerId: Id<'users'>
  revieweeId: Id<'users'>
  onClose: () => void
}) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [caption, setCaption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const createReview = useConvexMutation(api.reviews.createReview)
  const reviewee = useConvexQuery(api.users.getUserById, { userId: revieweeId })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caption.trim()) {
      setMessage('Please write a review')
      return
    }

    setIsSubmitting(true)
    try {
      await createReview({
        bookingId,
        reviewerId,
        revieweeId,
        rating,
        caption: caption.trim(),
        images: [],
      })
      setMessage('Review submitted!')
      setTimeout(onClose, 1000)
    } catch {
      setMessage('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="card-elevated rounded-2xl p-6 w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-foreground">Leave a Review</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {reviewee && (
          <div className="flex items-center gap-3 mb-6 bg-foreground/3 rounded-xl p-3">
            <img
              src={reviewee.avatarUrl || '/profile-placeholder.svg'}
              alt={reviewee.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-sm text-foreground">{reviewee.fullName}</p>
              <p className="text-xs text-muted-foreground">How was your experience?</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Great'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Your Review</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input-warm w-full min-h-[100px] resize-none"
              placeholder="Share your experience with this friend..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-foreground/5 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>

          {message && (
            <p className={`text-sm text-center font-medium ${
              message.includes('submitted') ? 'text-secondary' : 'text-destructive'
            }`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

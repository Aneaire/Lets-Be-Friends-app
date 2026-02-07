import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import {
  ArrowLeft, MapPin, Calendar, Clock, DollarSign,
  MessageCircle, Edit, Star, Tag, ChevronLeft,
  ChevronRight, Heart, Send, Image as ImageIcon, X,
  CheckCircle, Users,
} from 'lucide-react'
import { getStorageUrl } from '../lib/storage'
import { withOnboardingComplete } from '../lib/auth'
import { Button } from '../components/ui/button'
import type { Doc, Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/service/$serviceId')({
  component: withOnboardingComplete(ServiceDetail),
})

function ServiceDetail() {
  const { serviceId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const router = useRouter()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const service = useConvexQuery(api.services.getService, { serviceId: serviceId as Id<'services'> })
  const owner = useConvexQuery(
    api.users.getUserById,
    service?.userId ? { userId: service.userId } : 'skip',
  )
  const ownerRating = useConvexQuery(
    api.reviews.getAverageRating,
    service?.userId ? { revieweeId: service.userId } : 'skip',
  )
  const reviews = useConvexQuery(
    api.reviews.listReviewsByUser,
    service?.userId ? { revieweeId: service.userId } : 'skip',
  )

  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <ServiceDetailSkeleton />
        </div>
      </div>
    )
  }

  const isOwnService = currentUser?._id === service.userId

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        <div className="mb-6 animate-fade-in">
          <button
            onClick={() => router.history.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* Image Gallery */}
        {service.images.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden mb-6 animate-fade-up" style={{ animationFillMode: 'both' }}>
            <img
              src={getStorageUrl(service.images[currentImageIndex])}
              alt={`${service.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-64 md:h-80 object-cover"
            />
            {service.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === 0 ? service.images.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === service.images.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {service.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Title & Category */}
            <div className="card-elevated rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                      {service.category}
                    </span>
                    {service.isActive && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {service.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {service.location}
                    </span>
                    {ownerRating && ownerRating.count > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-foreground">{ownerRating.rating.toFixed(1)}</span>
                        <span>({ownerRating.count} review{ownerRating.count !== 1 ? 's' : ''})</span>
                      </span>
                    )}
                  </div>
                </div>
                {isOwnService && (
                  <Link
                    to="/service/$serviceId/edit"
                    params={{ serviceId: service._id as string }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-foreground/5 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-heading text-3xl font-bold text-primary">₱{service.pricePerHour}</span>
                <span className="text-muted-foreground text-sm">/hour</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="font-heading text-lg font-semibold mb-3 text-foreground">About this service</h2>
                <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">{service.description}</p>
              </div>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary/8 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {service.availability.length > 0 && (
                <div>
                  <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Availability
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {service.availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 bg-foreground/3 px-4 py-2.5 rounded-xl text-sm text-foreground/80"
                      >
                        <Calendar className="h-4 w-4 text-secondary" />
                        <span>{slot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="card-elevated rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Star className="h-5 w-5 text-amber-400" />
                Reviews
                {ownerRating && ownerRating.count > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({ownerRating.count})
                  </span>
                )}
              </h2>

              {!reviews || reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                    <Star className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-muted-foreground text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Card */}
            <div className="card-elevated rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Service Provider
              </h3>
              {owner ? (
                <div className="space-y-4">
                  <Link
                    to="/profile/$userId"
                    params={{ userId: owner._id as string }}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={owner.avatarUrl || '/profile-placeholder.svg'}
                      alt={owner.fullName}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {owner.fullName}
                      </h4>
                      {owner.username && (
                        <p className="text-sm text-muted-foreground">@{owner.username}</p>
                      )}
                      {ownerRating && ownerRating.count > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.round(ownerRating.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-border'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({ownerRating.count})
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {owner.bio && (
                    <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
                      {owner.bio}
                    </p>
                  )}

                  <div className="space-y-2 pt-2">
                    {!isOwnService && (
                      <Button
                        onClick={() => setShowBookingModal(true)}
                        className="w-full gap-2"
                        size="lg"
                      >
                        <Users className="h-4 w-4" />
                        Book This Friend
                      </Button>
                    )}
                    <button
                      onClick={() => router.navigate({ to: '/messages' })}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-foreground/5 transition-colors text-sm font-medium"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-foreground/10" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-foreground/10 rounded w-3/4" />
                      <div className="h-3 bg-foreground/10 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary Card */}
            <div className="card-warm rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
              <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Pricing
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Hourly rate</span>
                  <span className="font-heading font-bold text-primary text-lg">₱{service.pricePerHour}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>2 hours</span>
                  <span>₱{(service.pricePerHour * 2).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>4 hours</span>
                  <span>₱{(service.pricePerHour * 4).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>8 hours (full day)</span>
                  <span>₱{(service.pricePerHour * 8).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && currentUser && (
          <BookingModal
            service={service}
            currentUser={currentUser}
            onClose={() => setShowBookingModal(false)}
            onSuccess={() => {
              setShowBookingModal(false)
              router.navigate({ to: '/bookings' })
            }}
          />
        )}
      </div>
    </div>
  )
}

// Booking Modal Component
function BookingModal({
  service,
  currentUser,
  onClose,
  onSuccess,
}: {
  service: Doc<'services'>
  currentUser: Doc<'users'>
  onClose: () => void
  onSuccess: () => void
}) {
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingDuration, setBookingDuration] = useState('1')
  const [bookingNotes, setBookingNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')

  const createBooking = useConvexMutation(api.bookings.createBooking)
  const totalPrice = parseFloat(bookingDuration) * service.pricePerHour

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bookingDate || !bookingTime) {
      setBookingMessage('Please select date and time')
      return
    }

    setIsBooking(true)
    setBookingMessage('')

    try {
      const scheduledDate = new Date(`${bookingDate}T${bookingTime}`).getTime()

      await createBooking({
        bookerId: currentUser._id,
        serviceId: service._id,
        ownerId: service.userId,
        scheduledDate,
        duration: parseInt(bookingDuration),
        notes: bookingNotes,
      })

      setBookingMessage('Booking request sent!')
      setTimeout(onSuccess, 1500)
    } catch {
      setBookingMessage('Failed to book service. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="card-elevated rounded-2xl p-6 w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-foreground">Book a Friend</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleBookService} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-warm w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Time</label>
            <input
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="input-warm w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Duration (hours)</label>
            <select
              value={bookingDuration}
              onChange={(e) => setBookingDuration(e.target.value)}
              className="input-warm w-full"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <option key={h} value={h}>
                  {h} hour{h !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-pink rounded-xl p-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-foreground/70">
                {bookingDuration} hr{bookingDuration !== '1' ? 's' : ''} x ₱{service.pricePerHour}
              </span>
              <span className="text-foreground/70">₱{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center font-bold border-t border-primary/10 pt-2">
              <span className="text-foreground">Total</span>
              <span className="font-heading text-xl text-primary">₱{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Notes (optional)</label>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              className="input-warm w-full min-h-[80px] resize-none"
              placeholder="Any special requests or notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-foreground/5 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isBooking}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {isBooking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>

          {bookingMessage && (
            <p className={`text-sm text-center font-medium ${
              bookingMessage.includes('sent') ? 'text-secondary' : 'text-destructive'
            }`}>
              {bookingMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// Review Card Component
function ReviewCard({ review }: { review: Doc<'reviews'> }) {
  const reviewer = useConvexQuery(api.users.getUserById, { userId: review.reviewerId })

  return (
    <div className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
      <div className="flex items-start gap-3">
        <img
          src={reviewer?.avatarUrl || '/profile-placeholder.svg'}
          alt={reviewer?.fullName || 'User'}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">
              {reviewer?.fullName || 'Anonymous'}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-border'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">{review.caption}</p>
          <span className="text-xs text-muted-foreground mt-1 block">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

// Skeleton Loading
function ServiceDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-20 bg-foreground/10 rounded" />
      <div className="h-64 bg-foreground/10 rounded-2xl" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="card-elevated rounded-2xl p-6">
            <div className="h-6 w-24 bg-foreground/10 rounded-full mb-4" />
            <div className="h-8 bg-foreground/10 rounded w-3/4 mb-2" />
            <div className="h-4 bg-foreground/10 rounded w-1/2 mb-6" />
            <div className="h-10 bg-foreground/10 rounded w-1/3 mb-6" />
            <div className="space-y-2">
              <div className="h-4 bg-foreground/10 rounded" />
              <div className="h-4 bg-foreground/10 rounded w-5/6" />
              <div className="h-4 bg-foreground/10 rounded w-4/6" />
            </div>
          </div>
        </div>
        <div className="card-elevated rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-foreground/10" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-foreground/10 rounded w-3/4" />
              <div className="h-3 bg-foreground/10 rounded w-1/2" />
            </div>
          </div>
          <div className="h-10 bg-foreground/10 rounded-xl mb-2" />
          <div className="h-10 bg-foreground/10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

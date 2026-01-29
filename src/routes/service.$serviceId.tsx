import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, MapPin, Calendar, DollarSign, MessageCircle, Edit } from 'lucide-react'
import { getStorageUrl } from '../lib/storage'

export const Route = createFileRoute('/service/$serviceId')({
  component: ServiceDetail,
})

function ServiceDetail() {
  const { serviceId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const router = useRouter()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const service = useConvexQuery(api.services.getService, { serviceId: serviceId as any })
  const owner = useConvexQuery(api.users.getUser, { userId: service?.userId ?? ('' as any) })

  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingDuration, setBookingDuration] = useState('1')
  const [bookingNotes, setBookingNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')

  const createBooking = useConvexMutation(api.bookings.createBooking)

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading service...</p>
        </div>
      </div>
    )
  }

  const isOwnService = currentUser?._id === service.userId
  const totalPrice = parseFloat(bookingDuration) * service.pricePerHour

  const handleSendMessage = () => {
    router.navigate({ to: '/messages' })
  }

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser || !service.userId) {
      setBookingMessage('Please log in to book a service')
      return
    }

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

      setBookingMessage('Booking request sent successfully!')

      setTimeout(() => {
        setShowBookingModal(false)
        setBookingDate('')
        setBookingTime('')
        setBookingDuration('1')
        setBookingNotes('')
        router.navigate({ to: '/bookings' })
      }, 1500)
    } catch (error) {
      setBookingMessage('Failed to book service. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.navigate({ to: '/discover' })}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Discover
          </button>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden mb-6">
          {service.images.length > 0 && (
            <div className="grid grid-cols-2 gap-1">
              {service.images.slice(0, 4).map((imageId, index) => (
                <img
                  key={imageId}
                  src={getStorageUrl(imageId)}
                  alt={`Service image ${index + 1}`}
                  className={`w-full h-48 object-cover ${index === 0 && service.images.length > 1 ? 'col-span-2' : ''}`}
                />
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    {service.category}
                  </span>
                  {service.isActive && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                      Active
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
              </div>

              {isOwnService && (
                <Link
                  to="/service/$serviceId/edit"
                  params={{ serviceId: service._id as string }}
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              )}
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">₱{service.pricePerHour}</span>
                <span className="text-muted-foreground">/hour</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="whitespace-pre-wrap">{service.description}</p>
            </div>

            {service.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {service.availability.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Availability</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {service.availability.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md text-sm"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{slot}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">About the Service Provider</h2>
          {owner ? (
            <div className="flex items-center gap-4">
              {owner.avatarUrl ? (
                <img
                  src={owner.avatarUrl}
                  alt={owner.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-2xl">
                  {owner.fullName.substring(0, 2)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{owner.fullName}</h3>
                <p className="text-muted-foreground">
                  {owner.username && `@${owner.username}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </button>
                {!isOwnService && (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p>Loading provider information...</p>
          )}
        </div>

        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Book {service.title}</h2>

              <form onSubmit={handleBookService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(e.target.value)}
                    min="1"
                    max="24"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{bookingDuration} hour{bookingDuration !== '1' ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Rate:</span>
                    <span>₱{service.pricePerHour}/hour</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₱{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false)
                      setBookingMessage('')
                    }}
                    className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBooking}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>

                {bookingMessage && (
                  <p className={`text-sm text-center ${
                    bookingMessage.includes('success') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {bookingMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

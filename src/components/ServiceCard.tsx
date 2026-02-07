import { Link } from '@tanstack/react-router'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { MapPin, Star } from 'lucide-react'
import { getStorageUrl } from '../lib/storage'
import type { Id } from '../../convex/_generated/dataModel'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Tutoring & Education': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  'Music & Arts': { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  'Fitness & Sports': { bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
  'Tech & IT Support': { bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700' },
  'Home Services': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  'Photography & Video': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  'Beauty & Wellness': { bg: 'bg-pink-50 border-pink-200', text: 'text-pink-700' },
  'Cooking & Food': { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  'Language & Translation': { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  'Other': { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700' },
}

interface ServiceCardProps {
  service: {
    _id: Id<'services'>
    title: string
    description: string
    category: string
    pricePerHour: number
    location: string
    images: string[]
    userId: Id<'users'>
  }
  index?: number
}

export default function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const owner = useConvexQuery(api.users.getUserById, { userId: service.userId })
  const ratingData = useConvexQuery(api.reviews.getAverageRating, { revieweeId: service.userId })

  const categoryStyle = CATEGORY_COLORS[service.category] ?? CATEGORY_COLORS['Other']

  return (
    <Link
      to="/service/$serviceId"
      params={{ serviceId: service._id as string }}
      className="card-elevated rounded-2xl overflow-hidden block group animate-fade-up"
      style={{ animationDelay: `${0.05 * index}s`, animationFillMode: 'both' }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {service.images.length > 0 ? (
          <img
            src={getStorageUrl(service.images[0])}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-pink flex items-center justify-center">
            <span className="text-white/80 font-heading text-lg">{service.category}</span>
          </div>
        )}

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border ${categoryStyle.bg} ${categoryStyle.text}`}
        >
          {service.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {service.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
          {service.description}
        </p>

        {/* Owner + Rating */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={owner?.avatarUrl || '/profile-placeholder.svg'}
            alt={owner?.fullName ?? 'User'}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs text-muted-foreground truncate flex-1">
            {owner?.fullName ?? 'Loading...'}
          </span>
          {ratingData && ratingData.count > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {ratingData.rating.toFixed(1)}
              <span className="text-muted-foreground/60">({ratingData.count})</span>
            </span>
          )}
        </div>

        {/* Price + Location */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="font-heading font-bold text-primary text-lg">
            ₱{service.pricePerHour}
            <span className="text-xs text-muted-foreground font-normal">/hr</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[110px]">{service.location}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

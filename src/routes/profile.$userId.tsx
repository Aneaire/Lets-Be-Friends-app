import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import {
  MapPin, Calendar, Heart, MessageCircle, UserPlus, UserMinus,
  Settings, User as UserIcon, Star, Briefcase, ImageIcon, Tag,
  BadgeCheck, Clock,
} from 'lucide-react'
import { getStorageUrl } from '../lib/storage'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/profile/$userId')({
  component: Profile,
})

type TabId = 'posts' | 'services' | 'reviews'

function Profile() {
  const { userId: rawUserId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('posts')

  // The URL param might be a Clerk ID (user_xxx) or a Convex document ID
  const isClerkId = rawUserId.startsWith('user_')

  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })

  // If the param is a Clerk ID, resolve it to a Convex user first
  const clerkResolvedUser = useConvexQuery(
    api.users.getCurrentUser,
    isClerkId ? { clerkId: rawUserId } : 'skip',
  )

  // The actual Convex user ID to use for all queries
  const profileUserId = isClerkId ? clerkResolvedUser?._id : rawUserId as Id<'users'>

  const profileUser = useConvexQuery(
    api.users.getUserById,
    profileUserId ? { userId: profileUserId } : 'skip',
  )
  const followCount = useConvexQuery(
    api.follows.getFollowCount,
    profileUserId ? { userId: profileUserId } : 'skip',
  )
  const isFollowingQuery = useConvexQuery(
    api.follows.isFollowing,
    currentUser?._id && profileUserId
      ? { followerId: currentUser._id, followingId: profileUserId }
      : 'skip',
  )
  const posts = useConvexQuery(
    api.posts.listPostsByUser,
    profileUserId ? { userId: profileUserId } : 'skip',
  )
  const services = useConvexQuery(
    api.services.listServicesByUser,
    profileUserId ? { userId: profileUserId } : 'skip',
  )
  const reviews = useConvexQuery(
    api.reviews.listReviewsByUser,
    profileUserId ? { revieweeId: profileUserId } : 'skip',
  )
  const avgRating = useConvexQuery(
    api.reviews.getAverageRating,
    profileUserId ? { revieweeId: profileUserId } : 'skip',
  )

  const followUser = useConvexMutation(api.follows.followUser)
  const unfollowUser = useConvexMutation(api.follows.unfollowUser)

  const isOwnProfile = currentUser?._id === profileUserId
  const isFollowing = isFollowingQuery ?? false

  const handleFollowToggle = () => {
    if (!currentUser || !profileUserId) return

    if (isFollowing) {
      void unfollowUser({
        followerId: currentUser._id,
        followingId: profileUserId,
      })
    } else {
      void followUser({
        followerId: currentUser._id,
        followingId: profileUserId,
      })
    }
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="card-elevated rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-border/50 animate-shimmer mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  const activeServices = services?.filter((s) => s.isActive) ?? []
  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'posts', label: 'Posts', count: posts?.length ?? 0 },
    { id: 'services', label: 'Services', count: activeServices.length },
    { id: 'reviews', label: 'Reviews', count: reviews?.length ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Header Card */}
        <div className="card-elevated rounded-2xl overflow-hidden mb-6 animate-fade-up" style={{ animationFillMode: 'both' }}>
          {/* Cover gradient */}
          <div className="h-36 bg-gradient-pink relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          <div className="px-6 pb-6 -mt-14 relative">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={profileUser.avatarUrl || '/profile-placeholder.svg'}
                  alt={profileUser.fullName}
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                />
              </div>

              <div className="flex-1 pt-2 md:pt-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h1 className="font-heading text-2xl font-bold text-foreground">
                        {profileUser.fullName}
                      </h1>
                      {profileUser.isVerified && (
                        <BadgeCheck className="h-5 w-5 text-secondary fill-secondary/20" />
                      )}
                    </div>
                    {profileUser.username && (
                      <p className="text-muted-foreground text-sm">@{profileUser.username}</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {isOwnProfile ? (
                      <Link
                        to="/profile/$userId/settings"
                        params={{ userId: rawUserId }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border transition-all duration-200 active:scale-[0.97]"
                      >
                        <Settings className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    ) : currentUser ? (
                      <>
                        <button
                          onClick={handleFollowToggle}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.97] ${
                            isFollowing
                              ? 'bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserMinus className="h-4 w-4" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Follow
                            </>
                          )}
                        </button>
                        <Link
                          to="/messages"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border transition-all duration-200 active:scale-[0.97]"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Link>
                      </>
                    ) : null}
                  </div>
                </div>

                {profileUser.bio && (
                  <p className="mb-4 whitespace-pre-wrap text-foreground/80 text-sm leading-relaxed max-w-xl">
                    {profileUser.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  {profileUser.location && profileUser.isLocationVisible && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <StatCard label="Posts" value={posts?.length ?? 0} icon={<ImageIcon className="h-4 w-4" />} />
          <StatCard label="Services" value={activeServices.length} icon={<Briefcase className="h-4 w-4" />} />
          <StatCard label="Friends" value={followCount?.followers ?? 0} icon={<UserIcon className="h-4 w-4" />} />
          <StatCard
            label="Rating"
            value={avgRating?.count ? `${avgRating.rating.toFixed(1)}` : '--'}
            icon={<Star className="h-4 w-4" />}
            subtitle={avgRating?.count ? `${avgRating.count} review${avgRating.count !== 1 ? 's' : ''}` : 'No reviews'}
          />
        </div>

        {/* Tabs */}
        <div className="animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <div className="flex gap-1 mb-6 p-1 bg-foreground/5 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${activeTab === tab.id ? 'text-primary' : 'text-muted'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && <PostsTab posts={posts ?? []} />}
          {activeTab === 'services' && <ServicesTab services={activeServices} />}
          {activeTab === 'reviews' && <ReviewsTab reviews={reviews ?? []} avgRating={avgRating} />}
        </div>
      </div>
    </div>
  )
}

/* ---- Stat Card ---- */

function StatCard({ label, value, icon, subtitle }: {
  label: string
  value: number | string
  icon: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="card-warm rounded-2xl p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-heading text-xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  )
}

/* ---- Posts Tab ---- */

function PostsTab({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState icon={<ImageIcon className="w-7 h-7 text-muted-foreground" />} message="No posts yet" />
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <Link
      to="/post/$postId"
      params={{ postId: post._id as string }}
      className="card-elevated rounded-2xl overflow-hidden block group"
    >
      {post.images?.length > 0 && (
        <img
          src={getStorageUrl(post.images[0])}
          alt="Post image"
          className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      )}
      <div className="p-4">
        <p className="mb-3 line-clamp-2 text-foreground/90 text-sm leading-relaxed">{post.caption}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ---- Services Tab ---- */

function ServicesTab({ services }: { services: any[] }) {
  if (services.length === 0) {
    return (
      <EmptyState icon={<Briefcase className="w-7 h-7 text-muted-foreground" />} message="No services offered yet" />
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  )
}

function ServiceCard({ service }: { service: any }) {
  return (
    <Link
      to="/service/$serviceId"
      params={{ serviceId: service._id as string }}
      className="card-elevated rounded-2xl overflow-hidden block group"
    >
      {service.images?.length > 0 && (
        <img
          src={getStorageUrl(service.images[0])}
          alt={service.title}
          className="w-full h-40 object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-bold text-foreground text-base line-clamp-1">{service.title}</h3>
          <span className="flex-shrink-0 text-sm font-bold text-primary">
            ₱{service.pricePerHour}/hr
          </span>
        </div>
        <p className="text-sm text-foreground/70 line-clamp-2 mb-3">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-foreground/5 px-2.5 py-1 rounded-full">
            <Tag className="h-3 w-3" />
            {service.category}
          </span>
          {service.location && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {service.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ---- Reviews Tab ---- */

function ReviewsTab({ reviews, avgRating }: { reviews: any[]; avgRating: { rating: number; count: number } | undefined | null }) {
  if (reviews.length === 0) {
    return (
      <EmptyState icon={<Star className="w-7 h-7 text-muted-foreground" />} message="No reviews yet" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Rating summary */}
      {avgRating && avgRating.count > 0 && (
        <div className="card-warm rounded-2xl p-5 flex items-center gap-4">
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-foreground">{avgRating.rating.toFixed(1)}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(avgRating.rating) ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
                />
              ))}
            </div>
          </div>
          <div className="h-10 w-px bg-border" />
          <p className="text-sm text-muted-foreground">
            Based on <span className="font-semibold text-foreground">{avgRating.count}</span> review{avgRating.count !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Review cards */}
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: any }) {
  const reviewer = useConvexQuery(api.users.getUserById, { userId: review.reviewerId })

  return (
    <div className="card-elevated rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={reviewer?.avatarUrl || '/profile-placeholder.svg'}
          alt={reviewer?.fullName ?? 'Reviewer'}
          className="w-10 h-10 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-foreground truncate">
              {reviewer?.fullName ?? 'Loading...'}
            </p>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">{review.caption}</p>
      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {review.images.map((img: string, i: number) => (
            <img
              key={i}
              src={getStorageUrl(img)}
              alt="Review image"
              className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- Empty State ---- */

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="card-warm rounded-2xl p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  )
}

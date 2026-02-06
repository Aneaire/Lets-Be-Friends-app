import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import { MapPin, Calendar, Heart, MessageCircle, UserPlus, UserMinus, Settings, User as UserIcon } from 'lucide-react'
import { getStorageUrl } from '../lib/storage'

export const Route = createFileRoute('/profile/$userId')({
  component: Profile,
})

function Profile() {
  const { userId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const profileUser = useConvexQuery(api.users.getUser, { userId: userId as any })
  const followCount = useConvexQuery(api.follows.getFollowCount, { userId: userId as any })
  const isFollowingQuery = useConvexQuery(api.follows.isFollowing, {
    followerId: currentUser?._id ?? ('' as any),
    followingId: userId as any,
  })
  const posts = useConvexQuery(api.posts.listPostsByUser, { userId: userId as any })

  const followUser = useConvexMutation(api.follows.followUser)
  const unfollowUser = useConvexMutation(api.follows.unfollowUser)

  const isOwnProfile = currentUser?._id === userId
  const isFollowing = isFollowingQuery ?? false

  const handleFollowToggle = () => {
    if (!currentUser) return

    if (isFollowing) {
      void unfollowUser({
        followerId: currentUser._id,
        followingId: userId as any,
      })
    } else {
      void followUser({
        followerId: currentUser._id,
        followingId: userId as any,
      })
    }
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="card-elevated rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-border/50 animate-shimmer mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Header Card */}
        <div className="card-elevated rounded-2xl overflow-hidden mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-sunset relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={profileUser.avatarUrl || "/profile-placeholder.svg"}
                  alt={profileUser.fullName}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                />
              </div>

              <div className="flex-1 pt-2 md:pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h1 className="font-heading text-2xl font-bold text-foreground">
                        {profileUser.username || profileUser.fullName}
                      </h1>
                      {profileUser.isVerified && (
                        <span className="bg-secondary text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{profileUser.fullName}</p>
                  </div>

                  {!isOwnProfile && currentUser && (
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
                  )}

                  {isOwnProfile && (
                    <Link
                      to="/profile/$userId/settings"
                      params={{ userId }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border transition-all duration-200 active:scale-[0.97]"
                    >
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Link>
                  )}
                </div>

                {profileUser.bio && (
                  <p className="mb-4 whitespace-pre-wrap text-foreground/80 text-sm leading-relaxed">{profileUser.bio}</p>
                )}

                <div className="flex flex-wrap gap-5 text-sm">
                  {followCount && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{followCount.following}</span>
                        <span className="text-muted-foreground">Following</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{followCount.followers}</span>
                        <span className="text-muted-foreground">Followers</span>
                      </div>
                    </>
                  )}
                  {profileUser.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="animate-fade-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <h2 className="font-heading text-xl font-bold mb-4 text-foreground">
            Posts ({posts?.length ?? 0})
          </h2>

          {!posts || posts.length === 0 ? (
            <div className="card-warm rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No posts yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PostCardProps {
  post: any
}

function PostCard({ post }: PostCardProps) {
  return (
    <Link
      to="/post/$postId"
      params={{ postId: post._id as string }}
      className="card-elevated rounded-2xl overflow-hidden block group"
    >
      {post.images.length > 0 && (
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

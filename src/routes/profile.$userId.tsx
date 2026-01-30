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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={profileUser.avatarUrl || "/profile-placeholder.svg"}
                alt={profileUser.fullName}
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">
                      {profileUser.username || profileUser.fullName}
                    </h1>
                    {profileUser.isVerified && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{profileUser.fullName}</p>
                </div>

                {!isOwnProfile && currentUser && (
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                      isFollowing
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
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
                    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Link>
                )}
              </div>

              {profileUser.bio && (
                <p className="mb-4 whitespace-pre-wrap">{profileUser.bio}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm">
                {followCount && (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{followCount.following}</span>
                      <span className="text-muted-foreground">Following</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{followCount.followers}</span>
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                  </>
                )}
                {profileUser.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Posts ({posts?.length ?? 0})
          </h2>

          {!posts || posts.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No posts yet.</p>
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
      className="bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer block"
    >
      {post.images.length > 0 && (
        <img
          src={getStorageUrl(post.images[0])}
          alt="Post image"
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <p className="mb-3 line-clamp-2">{post.caption}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

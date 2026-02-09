import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { Bookmark, Heart, MessageCircle } from 'lucide-react'
import { getStorageUrl } from '../lib/storage'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/saved')({
  component: withOnboardingComplete(SavedPosts),
})

function SavedPosts() {
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const savedPosts = useConvexQuery(
    api.posts.listSavedPosts,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  )
  const toggleSave = useConvexMutation(api.posts.savePost)

  const handleUnsave = (postId: Id<'posts'>) => {
    if (!currentUser?._id) return
    void toggleSave({ userId: currentUser._id, postId })
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Saved Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">Posts you've bookmarked for later</p>
        </div>

        {savedPosts && savedPosts.length === 0 ? (
          <div className="card-warm rounded-2xl p-12 text-center animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-7 h-7 text-primary" />
            </div>
            <p className="text-muted-foreground font-medium">No saved posts yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Bookmark posts you like to find them here later
            </p>
            <Link
              to="/dashboard"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Posts
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPosts?.map((post, index) => (
              <div
                key={post._id}
                className="card-elevated rounded-2xl overflow-hidden animate-fade-up"
                style={{ animationDelay: `${0.05 * index}s`, animationFillMode: 'both' }}
              >
                {/* Post Image */}
                {post.images && post.images.length > 0 && (
                  <Link to="/post/$postId" params={{ postId: post._id as string }}>
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={getStorageUrl(post.images[0])}
                        alt="Post"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                )}

                <div className="p-4">
                  {/* Author Info */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <img
                      src={post.authorAvatar || '/profile-placeholder.svg'}
                      alt={post.authorName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10"
                    />
                    <span className="text-sm font-medium text-foreground">{post.authorName}</span>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <Link to="/post/$postId" params={{ postId: post._id as string }}>
                      <p className="text-sm text-foreground/80 line-clamp-2 mb-3 hover:text-foreground transition-colors">
                        {post.caption}
                      </p>
                    </Link>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-3.5 h-3.5" />
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {post.commentsCount}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUnsave(post._id)}
                      className="p-1.5 rounded-lg hover:bg-foreground/5 transition-colors text-primary"
                      title="Remove from saved"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

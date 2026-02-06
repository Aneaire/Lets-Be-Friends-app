import { createFileRoute, Link } from '@tanstack/react-router'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useConvexUserSync } from '../hooks/useConvexUserSync'
import { withOnboardingComplete } from '../lib/auth'
import { PostCard } from '../components/PostCard'
import { PostCardSkeleton } from '../components/PostCardSkeleton'
import { Send, Feather } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: withOnboardingComplete(Dashboard),
})

function Dashboard() {
  const [caption, setCaption] = useState('')
  const { userId } = useAuth()
  useConvexUserSync()

  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: userId ?? '' })
  const posts = useConvexQuery(api.posts.listPosts, { userId: currentUser?._id })

  const createPost = useConvexMutation(api.posts.createPost)
  const toggleLike = useConvexMutation(api.posts.toggleLike)
  const savePost = useConvexMutation(api.posts.savePost)

  const handlePost = async () => {
    if (!currentUser || !caption.trim()) {
      return
    }

    await createPost({
      userId: currentUser._id,
      caption,
      images: [],
      tags: [],
    })
    setCaption('')
  }

  const handleLike = (postId: string) => {
    if (!currentUser) {
      return
    }
    void toggleLike({ userId: currentUser._id, postId: postId as any })
  }

  const handleSave = (postId: string) => {
    if (!currentUser) {
      return
    }
    void savePost({ userId: currentUser._id, postId: postId as any })
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <SignedIn>
          {/* Page Header */}
          <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
            <h1 className="font-heading text-3xl font-bold text-foreground">Home</h1>
            <p className="text-muted-foreground text-sm mt-1">See what your friends are sharing</p>
          </div>

          {/* Composer */}
          <div className="card-elevated rounded-2xl p-5 mb-8 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-pink flex items-center justify-center flex-shrink-0">
                <Feather className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share something with your friends..."
                  className="input-warm w-full resize-none min-h-[80px] text-sm"
                  rows={3}
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={() => void handlePost()}
                    disabled={!caption.trim()}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-5">
            {posts === undefined ? (
              <div className="space-y-5">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : posts.length === 0 ? (
              <div className="card-warm rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                  <Feather className="w-7 h-7 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">No posts yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onLike={handleLike} onSave={handleSave} />
              ))
            )}
          </div>
        </SignedIn>

        <SignedOut>
          <div className="max-w-md mx-auto text-center py-16">
            <h1 className="font-heading text-3xl font-bold mb-4 text-foreground">Welcome to Let&apos;s Be Friends</h1>
            <p className="text-muted-foreground mb-8">
              A social marketplace platform for connecting people and building meaningful friendships
            </p>
            <Link to="/auth/sign-in">
              <Button size="lg">Sign In to Continue</Button>
            </Link>
          </div>
        </SignedOut>
      </div>
    </div>
  )
}

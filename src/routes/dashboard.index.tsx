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
    <div className="container mx-auto px-4 py-8">
      <SignedIn>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Home</h1>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => void handlePost()} disabled={!caption.trim()}>Post</Button>
            </div>
          </div>

          <div className="space-y-6">
            {posts === undefined ? (
              <div className="space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet. Be the first to share something!
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onLike={handleLike} onSave={handleSave} />
              ))
            )}
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="max-w-md mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Welcome to Let&apos;s Be Friends</h1>
          <p className="text-muted-foreground mb-8">
            A social marketplace platform for connecting people and building meaningful friendships
          </p>
            <Link to="/auth/sign-in">
              <Button size="lg" variant="secondary">Sign In to Continue</Button>
            </Link>
        </div>
      </SignedOut>
    </div>
  )
}

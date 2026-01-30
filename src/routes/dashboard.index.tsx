import { createFileRoute, Link } from '@tanstack/react-router'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useConvexUserSync } from '../hooks/useConvexUserSync'
import type { Doc } from '../../convex/_generated/dataModel'
import { withOnboardingComplete } from '../lib/auth'
import { getStorageUrl } from '../lib/storage'

export const Route = createFileRoute('/dashboard/')({
  component: withOnboardingComplete(Dashboard),
})

function Dashboard() {
  const [caption, setCaption] = useState('')
  const { userId } = useAuth()
  useConvexUserSync()

  const posts = useConvexQuery(api.posts.listPosts, {})
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: userId ?? '' })

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
              <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
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
            <Button size="lg">Sign In to Continue</Button>
          </Link>
        </div>
      </SignedOut>
    </div>
  )
}

interface PostCardProps {
  post: Doc<'posts'>
  // eslint-disable-next-line no-unused-vars
  onLike: (postId: string) => void
  // eslint-disable-next-line no-unused-vars
  onSave: (postId: string) => void
}

function PostCard({ post, onLike, onSave }: PostCardProps) {
  const postAuthor = useConvexQuery(api.users.getUserById, { userId: post.userId })

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        {postAuthor ? (
          <>
            <img
              src={postAuthor.avatarUrl || "/profile-placeholder.svg"}
              alt={postAuthor.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{postAuthor.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {postAuthor.username && `@${postAuthor.username}`}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {post.userId.substring(0, 2)}
            </div>
            <div>
              <div className="font-semibold">Loading...</div>
            </div>
          </>
        )}
      </div>

      <p className="mb-4 whitespace-pre-wrap">{post.caption}</p>

          {post.images.length > 0 && (
            <div className="mb-4 grid gap-2">
              {post.images.map((image: string, idx: number) => (
                <img key={idx} src={getStorageUrl(image)} alt="" className="rounded-lg w-full" />
              ))}
            </div>
          )}

      <div className="flex items-center gap-4 pt-4 border-t">
        <Button variant="ghost" size="sm" onClick={() => onLike(post._id)}>
          {post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}
        </Button>
        <Button variant="ghost" size="sm">
          {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onSave(post._id)}>
          Save
        </Button>
      </div>
    </div>
  )
}

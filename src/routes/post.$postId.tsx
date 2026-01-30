import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Heart, MessageCircle, Bookmark, Send, MapPin, Share2 } from 'lucide-react'
import { getStorageUrl } from '../lib/storage'

export const Route = createFileRoute('/post/$postId')({
  component: PostDetail,
})

function PostDetail() {
  const { postId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const router = useRouter()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const post = useConvexQuery(api.posts.getPost, { postId: postId as any })
  const postAuthor = useConvexQuery(api.users.getUserById, { userId: post?.userId ?? ('' as any) })
  const comments = useConvexQuery(api.comments.listComments, { postId: postId as any })
  const isLiked = useConvexQuery(api.posts.isPostLiked, {
    userId: currentUser?._id ?? ('' as any),
    postId: postId as any,
  })
  const isSaved = useConvexQuery(api.posts.isPostSaved, {
    userId: currentUser?._id ?? ('' as any),
    postId: postId as any,
  })

  const [commentText, setCommentText] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleLike = useConvexMutation(api.posts.toggleLike)
  const savePost = useConvexMutation(api.posts.savePost)
  const createComment = useConvexMutation(api.comments.createComment)
  const toggleCommentLike = useConvexMutation(api.comments.toggleLike)

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading post...</p>
        </div>
      </div>
    )
  }

  const handleToggleLike = () => {
    if (!currentUser) return
    void toggleLike({
      userId: currentUser._id,
      postId: post._id,
    })
  }

  const handleSave = () => {
    if (!currentUser) return
    void savePost({
      userId: currentUser._id,
      postId: post._id,
    })
  }

  const handleSubmitComment = () => {
    if (!currentUser || !commentText.trim()) return

    setIsSubmitting(true)

    void createComment({
      postId: post._id,
      userId: currentUser._id,
      parentCommentId: replyToId as any,
      content: commentText,
    }).finally(() => {
      setCommentText('')
      setReplyToId(null)
      setIsSubmitting(false)
    })
  }

  const handleReply = (commentId: string, username: string) => {
    setReplyToId(commentId)
    setCommentText(`@${username} `)
  }

  const handleToggleCommentLike = (commentId: string) => {
    if (!currentUser) return
    void toggleCommentLike({
      userId: currentUser._id,
      commentId: commentId as any,
    })
  }

  const getReplies = (parentCommentId: string) => {
    return comments?.filter((c) => c.parentCommentId === parentCommentId) ?? []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.navigate({ to: '/dashboard' })}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden mb-6">
          {post.images.length > 0 && (
            <div className="grid gap-1">
              {post.images.length === 1 && (
                <img
                  src={getStorageUrl(post.images[0])}
                  alt="Post image"
                  className="w-full h-auto max-h-[600px] object-cover"
                />
              )}
              {post.images.length === 2 && (
                <div className="grid grid-cols-2">
                  <img
                    src={getStorageUrl(post.images[0])}
                    alt="Post image 1"
                    className="w-full h-80 object-cover"
                  />
                  <img
                    src={getStorageUrl(post.images[1])}
                    alt="Post image 2"
                    className="w-full h-80 object-cover"
                  />
                  <img
                    src={getStorageUrl(post.images[1])}
                    alt="Post image 2"
                    className="w-full h-auto max-h-[600px] object-cover"
                  />
                  <img
                    src={`/api/storage/${post.images[1]}`}
                    alt="Post image 2"
                    className="w-full h-80 object-cover"
                  />
                </div>
              )}
               {post.images.length >= 3 && (
                <div className="grid grid-cols-2">
                  <img
                    src={getStorageUrl(post.images[0])}
                    alt="Post image 1"
                    className="w-full h-80 object-cover"
                  />
                  <div className="grid grid-rows-2 gap-1">
                    <img
                      src={getStorageUrl(post.images[1])}
                      alt="Post image 2"
                      className="w-full h-full object-cover"
                    />
                    <div className="relative">
                      <img
                        src={getStorageUrl(post.images[2])}
                        alt="Post image 3"
                        className="w-full h-full object-cover"
                      />
                      {post.images.length > 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-semibold">
                          +{post.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              {postAuthor && (
                <div className="flex items-center gap-3">
                  <img
                    src={postAuthor.avatarUrl || "/profile-placeholder.svg"}
                    alt={postAuthor.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{postAuthor.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {postAuthor.username && `@${postAuthor.username}`}
                    </p>
                  </div>
                </div>
              )}
              <button className="p-2 hover:bg-muted rounded-md">
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <p className="mb-4 whitespace-pre-wrap">{post.caption}</p>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {post.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{post.location}</span>
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-b py-4 my-4">
              <button
                onClick={handleToggleLike}
                disabled={!currentUser}
                className={`flex items-center gap-2 hover:bg-muted px-3 py-2 rounded-md transition-colors ${
                  isLiked ? 'text-red-500' : 'text-foreground'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.likesCount}</span>
              </button>

              <button className="flex items-center gap-2 hover:bg-muted px-3 py-2 rounded-md transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span>{post.commentsCount}</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!currentUser}
                className={`flex items-center gap-2 hover:bg-muted px-3 py-2 rounded-md transition-colors ${
                  isSaved ? 'text-primary' : 'text-foreground'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Comments</h2>

          {currentUser && (
            <div className="mb-6">
              {replyToId && (
                <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-md mb-3">
                  <span className="text-sm text-muted-foreground">Replying to comment</span>
                  <button
                    onClick={() => {
                      setReplyToId(null)
                      setCommentText('')
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <img
                  src={currentUser.avatarUrl || "/profile-placeholder.svg"}
                  alt={currentUser.fullName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || isSubmitting}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments
                .filter((comment) => !comment.parentCommentId)
                .map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    authorId={comment.userId}
                    replies={getReplies(comment._id)}
                    onReply={handleReply}
                    onLike={handleToggleCommentLike}
                    showReplies={showReplies[comment._id] ?? false}
                    onToggleReplies={() =>
                      setShowReplies((prev) => ({
                        ...prev,
                        [comment._id]: !prev[comment._id],
                      }))
                    }
                  />
                ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: any
  authorId: string
  replies: any[]
  onReply: (commentId: string, username: string) => void
  onLike: (commentId: string) => void
  showReplies: boolean
  onToggleReplies: () => void
}

function CommentItem({
  comment,
  authorId,
  replies,
  onReply,
  onLike,
  showReplies,
  onToggleReplies,
}: CommentItemProps) {
  const author = useConvexQuery(api.users.getUserById, { userId: authorId as any })
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const isLiked = useConvexQuery(api.comments.isCommentLiked, {
    userId: currentUser?._id ?? ('' as any),
    commentId: comment._id as any,
  })

  return (
    <div className="flex gap-3">
      {author ? (
        <>
          <img
            src={author.avatarUrl || "/profile-placeholder.svg"}
            alt={author.fullName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{author.fullName}</span>
                  <span className="text-sm text-muted-foreground">
                    {author.username && `@${author.username}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="mb-3 whitespace-pre-wrap">{comment.content}</p>
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => onLike(comment._id)}
                  disabled={!currentUser}
                  className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                    isLiked ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{comment.likesCount}</span>
                </button>
                <button
                  onClick={() => author && onReply(comment._id, author.username || author.fullName)}
                  disabled={!currentUser}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Reply
                </button>
              </div>
            </div>

            {replies.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={onToggleReplies}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {showReplies ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </button>

                {showReplies && (
                  <div className="mt-3 space-y-3">
                    {replies.map((reply) => (
                      <ReplyItem
                        key={reply._id}
                        reply={reply}
                        onLike={onLike}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

interface ReplyItemProps {
  reply: any
  onLike: (commentId: string) => void
}

function ReplyItem({ reply, onLike }: ReplyItemProps) {
  const author = useConvexQuery(api.users.getUser, { userId: reply.userId as any })
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const isLiked = useConvexQuery(api.comments.isCommentLiked, {
    userId: currentUser?._id ?? ('' as any),
    commentId: reply._id as any,
  })

  return (
    <div className="flex gap-3">
      {author ? (
        <>
          <img
            src={author.avatarUrl || "/profile-placeholder.svg"}
            alt={author.fullName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">{author.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(reply.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm mb-2 whitespace-pre-wrap">{reply.content}</p>
              <button
                onClick={() => onLike(reply._id)}
                disabled={!currentUser}
                className={`text-xs flex items-center gap-1 hover:text-foreground transition-colors ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                <span>{reply.likesCount}</span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

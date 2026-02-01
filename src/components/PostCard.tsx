import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import { getStorageUrl } from '../lib/storage'
import { Button } from './ui/button'
import { Heart } from 'lucide-react'

interface PostCardProps {
  post: Doc<'posts'> & { isLiked?: boolean }
  // eslint-disable-next-line no-unused-vars
  onLike: (postId: string) => void
  // eslint-disable-next-line no-unused-vars
  onSave: (postId: string) => void
}

export function PostCard({ post, onLike, onSave }: PostCardProps) {
  const postAuthor = useConvexQuery(api.users.getUserById, { userId: post.userId })

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        {postAuthor ? (
          <>
            <img
              src={postAuthor.avatarUrl ? getStorageUrl(postAuthor.avatarUrl) : '/profile-placeholder.svg'}
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
            <img
              src="/profile-placeholder.svg"
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post._id)}
          className={`hover:text-inherit hover:bg-muted/30 ${post.isLiked ? 'text-red-500' : ''}`}
        >
          {post.isLiked ? (
            <>
              <Heart className="h-4 w-4 fill-current" />
              <span>{post.likesCount}</span>
            </>
          ) : (
            <>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</>
          )}
        </Button>
        <Button variant="ghost" size="sm" className="hover:text-inherit hover:bg-muted/30">
          {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSave(post._id)}
          className="hover:text-inherit hover:bg-muted/30"
        >
          Save
        </Button>
      </div>
    </div>
  )
}

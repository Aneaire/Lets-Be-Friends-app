import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import { getStorageUrl } from '../lib/storage'
import { Button } from './ui/button'
import { Heart } from 'lucide-react'
import { StorageImage } from './StorageImage'

interface PostCardProps {
  post: Doc<'posts'> & { isLiked?: boolean }
  // eslint-disable-next-line no-unused-vars
  onLike: (postId: string) => void
  // eslint-disable-next-line no-unused-vars
  onSave: (postId: string) => void
}

export function PostCard({ post, onLike, onSave }: PostCardProps) {
  const author = useConvexQuery(api.users.getUserById, { userId: post.userId })

  const avatar = author?.avatarUrl ? (
    <StorageImage storageId={author.avatarUrl} alt={author.fullName} className="w-10 h-10 rounded-full object-cover" />
  ) : (
    <img src="/profile-placeholder.svg" alt="User" className="w-10 h-10 rounded-full object-cover" />
  )

  return (
    <div className="bg-card border border-border rounded-lg px-4 pt-3 pb-1">
      <div className="flex items-center gap-2 mb-2">
        {avatar}
        <div>
          <div className="font-semibold">{author?.fullName ?? 'Loading...'}</div>
          {author?.username && <div className="text-sm text-muted-foreground">@{author.username}</div>}
        </div>
      </div>

      <p className="mb-2 whitespace-pre-wrap">{post.caption}</p>

      {post.images.length > 0 && (
        <div className="mb-2 grid gap-2">
          {post.images.map((image, idx) => <img key={idx} src={getStorageUrl(image)} alt="" className="rounded-lg w-full" />)}
        </div>
      )}

      <div className="flex items-center gap-2 pt-[3px] border-t border-border/50">
        <Button variant="ghost" size="sm" onClick={() => onLike(post._id)} className={`flex-1 h-7 px-2 hover:text-inherit hover:bg-muted/30 ${post.isLiked ? 'text-red-500' : ''}`}>
          {post.isLiked ? <><Heart className="h-4 w-4 fill-current" /><span>{post.likesCount}</span></> : `${post.likesCount} ${post.likesCount === 1 ? 'Like' : 'Likes'}`}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 h-7 px-2 hover:text-inherit hover:bg-muted/30">
          {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onSave(post._id)} className="flex-1 h-7 px-2 hover:text-inherit hover:bg-muted/30">Save</Button>
      </div>
    </div>
  )
}

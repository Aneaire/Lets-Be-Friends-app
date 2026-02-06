import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import { getStorageUrl } from '../lib/storage'
import { Button } from './ui/button'
import { Heart, MessageCircle, Bookmark } from 'lucide-react'
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
    <StorageImage storageId={author.avatarUrl} alt={author.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
  ) : (
    <img src="/profile-placeholder.svg" alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
  )

  return (
    <div className="card-elevated rounded-2xl overflow-hidden animate-fade-in">
      {/* Author header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        {avatar}
        <div className="min-w-0">
          <div className="font-semibold text-foreground text-sm">{author?.fullName ?? 'Loading...'}</div>
          {author?.username && (
            <div className="text-xs text-muted-foreground">@{author.username}</div>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="px-5 pb-3">
        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px]">{post.caption}</p>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="px-5 pb-3">
          <div className="rounded-xl overflow-hidden">
            {post.images.map((image, idx) => (
              <img key={idx} src={getStorageUrl(image)} alt="" className="w-full object-cover" />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center border-t border-border/60 mx-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post._id)}
          className={`flex-1 h-10 gap-1.5 rounded-none hover:bg-primary/5 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
        >
          <Heart className={`h-[18px] w-[18px] ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">{post.likesCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 h-10 gap-1.5 rounded-none text-muted-foreground hover:bg-secondary/5">
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="text-xs font-medium">{post.commentsCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSave(post._id)}
          className="flex-1 h-10 gap-1.5 rounded-none text-muted-foreground hover:bg-accent/10"
        >
          <Bookmark className="h-[18px] w-[18px]" />
          <span className="text-xs font-medium">Save</span>
        </Button>
      </div>
    </div>
  )
}

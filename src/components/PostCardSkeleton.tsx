import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg px-4 pt-3 pb-1">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <Skeleton className="h-16 w-full mb-2" />

      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Skeleton className="flex-1 h-7 rounded-md" />
        <Skeleton className="flex-1 h-7 rounded-md" />
        <Skeleton className="flex-1 h-7 rounded-md" />
      </div>
    </div>
  )
}

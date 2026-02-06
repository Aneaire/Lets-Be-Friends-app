import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <div className="card-elevated rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-28 mb-1.5" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="px-5 pb-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="flex items-center border-t border-border/60 mx-5">
        <Skeleton className="flex-1 h-10 rounded-none" />
        <Skeleton className="flex-1 h-10 rounded-none" />
        <Skeleton className="flex-1 h-10 rounded-none" />
      </div>
    </div>
  )
}

import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

interface StorageImageProps {
  storageId: string | null | undefined
  alt: string
  className?: string
}

export function StorageImage({ storageId, alt, className }: StorageImageProps) {
  const imageUrl = useQuery(
    api.storage.getUrl,
    storageId ? { storageId } : 'skip'
  )

  if (!storageId || !imageUrl) return null

  return <img src={imageUrl} alt={alt} className={className} />
}

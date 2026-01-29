export function getStorageUrl(storageId: string): string {
  const convexUrl = import.meta.env.VITE_CONVEX_URL ?? 'https://beloved-chihuahua-177.convex.cloud'
  return `${convexUrl}/api/storage/serveImage?storageId=${storageId}`
}

import { useState, useRef } from 'react'
import { useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react'
import { getStorageUrl } from '../lib/storage'

interface ImageDisplayProps {
  imageId: string
  index: number
  onRemove: () => void
}

function ImageDisplay({ imageId, index, onRemove }: ImageDisplayProps) {
  if (!imageId) return null

  return (
    <div className="relative group">
      <img
        src={getStorageUrl(imageId)}
        alt={`Upload ${index + 1}`}
        className="h-24 w-24 object-cover rounded-lg border"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove image"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

interface ImageUploadProps {
  maxImages?: number
  onImagesChange: (images: string[]) => void
  defaultImages?: string[]
  accept?: string
  className?: string
}

export function ImageUpload({
  maxImages = 5,
  onImagesChange,
  defaultImages = [],
  accept = 'image/*',
  className = '',
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(defaultImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const generateUploadUrl = useConvexMutation(api.storage.generateUploadUrl)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises: Promise<string>[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith('image/')) {
          const uploadUrl = await generateUploadUrl()
          console.log('Uploading to:', uploadUrl)

          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': file.type },
            body: file,
          })

          console.log('Upload response:', uploadResponse.status)

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`)
          }

          const { storageId } = await uploadResponse.json()
          uploadPromises.push(Promise.resolve(storageId))
        }
      }

      const newImageIds = await Promise.all(uploadPromises)
      const updatedImages = [...images, ...newImageIds]

      setImages(updatedImages)
      onImagesChange(updatedImages)
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Failed to upload images. Please try again.\nError: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`)
    } finally {
      setUploading(false)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-3 flex-wrap">
        {images.map((imageId, index) => (
          <ImageDisplay
            key={imageId}
            imageId={imageId}
            index={index}
            onRemove={() => removeImage(index)}
          />
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Add Image ({images.length + 1}/{maxImages})
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        disabled={uploading || images.length >= maxImages}
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  )
}

interface SingleImageUploadProps {
  onImageChange: (imageId: string | null) => void
  defaultImage?: string
  accept?: string
  className?: string
}

export function SingleImageUpload({
  onImageChange,
  defaultImage,
  accept = 'image/*',
  className = '',
}: SingleImageUploadProps) {
  const [imageId, setImageId] = useState<string | null>(defaultImage ?? null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const generateUploadUrl = useConvexMutation(api.storage.generateUploadUrl)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const uploadUrl = await generateUploadUrl()
      console.log('Uploading to:', uploadUrl)

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      console.log('Upload response:', uploadResponse.status)

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }

      const { storageId } = await uploadResponse.json()
      console.log('Extracted storageId:', storageId)
      setImageId(storageId)
      onImageChange(storageId)
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Failed to upload image. Please try again.\nError: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`)
    } finally {
      setUploading(false)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    setImageId(null)
    onImageChange(null)
  }

  return (
    <div className={className}>
      {imageId ? (
        <div className="relative group inline-block">
          <img
            src={getStorageUrl(imageId)}
            alt="Uploaded image"
            className="h-32 w-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload Image</span>
              </>
            )}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        disabled={uploading && !!imageId}
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  )
}

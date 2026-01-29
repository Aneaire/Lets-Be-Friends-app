import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Save, X, MapPin } from 'lucide-react'
import { ImageUpload } from '../components/ImageUpload'

export const Route = createFileRoute('/create-post')({
  component: withOnboardingComplete(CreatePost),
})

function CreatePost() {
  const { userId: clerkUserId } = useAuth()
  const router = useRouter()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })

  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const createPost = useConvexMutation(api.posts.createPost)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clerkUserId || !currentUser) {
      setSaveMessage('Please log in to create a post')
      return
    }

    if (!caption) {
      setSaveMessage('Please add a caption')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      await createPost({
        userId: currentUser._id,
        caption,
        images,
        tags,
        location: location || undefined,
      })

      setSaveMessage('Post created successfully!')

      setTimeout(() => {
        router.navigate({ to: '/dashboard' })
      }, 1500)
    } catch (error) {
      setSaveMessage('Failed to create post. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.navigate({ to: '/dashboard' })}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Create a Post</h1>

        <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Caption <span className="text-red-500">*</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location (optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add a location..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add a tag (press Enter)..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <ImageUpload
              maxImages={5}
              onImagesChange={setImages}
              defaultImages={images}
            />
          </div>

          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Creating...' : 'Create Post'}
            </button>

            {saveMessage && (
              <p className={`mt-2 text-sm text-center ${
                saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}>
                {saveMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

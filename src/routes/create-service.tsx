import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import { ImageUpload } from '../components/ImageUpload'

export const Route = createFileRoute('/create-service')({
  component: withOnboardingComplete(CreateService),
})

function CreateService() {
  const { userId: clerkUserId } = useAuth()
  const router = useRouter()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [availability, setAvailability] = useState<string[]>([])
  const [selectedDay, setSelectedDay] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const createService = useConvexMutation(api.services.createService)

  const categories = [
    'Photography',
    'Videography',
    'Music & Audio',
    'Event Planning',
    'Catering',
    'Cleaning',
    'Moving',
    'Personal Training',
    'Tutoring',
    'Web Design',
    'Graphic Design',
    'Writing',
    'Translation',
    'Social Media',
    'Consulting',
    'Other',
  ]

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddAvailability = () => {
    if (selectedDay && startTime && endTime) {
      const slot = `${selectedDay} ${startTime}-${endTime}`
      setAvailability([...availability, slot])
      setSelectedDay('')
      setStartTime('')
      setEndTime('')
    }
  }

  const handleRemoveAvailability = (slotToRemove: string) => {
    setAvailability(availability.filter((slot) => slot !== slotToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clerkUserId || !currentUser) {
      setSaveMessage('Please log in to create a service')
      return
    }

    if (!title || !description || !category || !pricePerHour || !location) {
      setSaveMessage('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      await createService({
        userId: currentUser._id,
        title,
        description,
        category,
        pricePerHour: parseFloat(pricePerHour),
        availability,
        location,
        tags,
        images,
      })

      setSaveMessage('Service created successfully!')

      setTimeout(() => {
        router.navigate({ to: '/discover' })
      }, 1500)
    } catch (error) {
      setSaveMessage('Failed to create service. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 animate-fade-in">
          <button
            onClick={() => router.navigate({ to: '/discover' })}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </button>
        </div>

        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Create a Service</h1>
          <p className="text-muted-foreground text-sm mt-1">Share your skills with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated rounded-2xl p-6 space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Service Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-warm w-full"
              placeholder="E.g., Professional Photography"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-warm w-full min-h-[150px] resize-none"
              placeholder="Describe your service in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-warm w-full"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Price per Hour (₱) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                min="0"
                step="0.01"
                className="input-warm w-full"
                placeholder="500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Location <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-warm w-full"
                placeholder="City, Province"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="input-warm flex-1"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary/8 text-primary px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Availability</label>
            <div className="grid sm:grid-cols-3 gap-2 mb-3">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="input-warm"
              >
                <option value="">Select day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-warm"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-warm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAvailability}
              disabled={!selectedDay || !startTime || !endTime}
              className="w-full sm:w-auto bg-foreground/5 text-foreground px-4 py-2 rounded-xl hover:bg-foreground/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Availability
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              {availability.map((slot) => (
                <span
                  key={slot}
                  className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {slot}
                  <button
                    type="button"
                    onClick={() => handleRemoveAvailability(slot)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Service Images</label>
            <ImageUpload
              maxImages={5}
              onImagesChange={setImages}
              defaultImages={images}
            />
          </div>

          <div className="border-t border-border pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-primary/20 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Creating...' : 'Create Service'}
            </button>

            {saveMessage && (
              <p className={`mt-3 text-sm text-center font-medium ${
                saveMessage.includes('success') ? 'text-secondary' : 'text-destructive'
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

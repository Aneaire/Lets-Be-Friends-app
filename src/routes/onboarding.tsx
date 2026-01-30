import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import { SingleImageUpload } from '../components/ImageUpload'
import { StorageImage } from '../components/StorageImage'
import { format } from 'date-fns'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
})

function Onboarding() {
  const { userId: clerkUserId } = useAuth()
  const navigate = useNavigate()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const isOnboardingComplete = currentUser?.isOnboardingComplete ?? false

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const getBirthday = () => {
    if (day && month && year) {
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }
    return undefined
  }

  const updateUserProfile = useConvexMutation(api.users.updateUserProfile)

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isOnboardingComplete) {
    navigate({ to: '/dashboard' })
    return null
  }

  if (!currentUser || currentUser.clerkId !== clerkUserId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-card border rounded-lg p-8">
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You must be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    const birthday = getBirthday()

    if (!fullName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }
    if (!birthday) {
      setError('Please select your birthday')
      return
    }
    if (!bio.trim()) {
      setError('Please enter a bio')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await updateUserProfile({
        clerkId: clerkUserId ?? '',
        username,
        fullName,
        bio,
        birthday: format(birthday, 'yyyy-MM-dd'),
        avatarUrl,
        isOnboardingComplete: true,
      })

      navigate({ to: '/dashboard' })
    } catch (error) {
      setError('Failed to create profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="bg-card border rounded-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Create Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in your details to get started</p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profile Picture (Optional)</label>
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <div className="relative">
                      <StorageImage
                        storageId={avatarUrl}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded object-cover border"
                      />
                      <button
                        onClick={() => setAvatarUrl('')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm hover:bg-destructive/90"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <img
                      src="/profile-placeholder.svg"
                      alt="Profile placeholder"
                      className="w-20 h-20 rounded border"
                    />
                  )}
                  <div className="flex-1">
                    <SingleImageUpload
                      defaultImage={avatarUrl}
                      onImageChange={(imageId) => setAvatarUrl(imageId ?? '')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Birthday</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 100 }, (_, i) => {
                        const y = new Date().getFullYear() - i
                        return (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] resize-none"
                  placeholder="Tell us about yourself, your interests, what you're looking for..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </div>

          <div className="px-6 py-4 bg-muted/30 border-t">
            <p className="text-xs text-center text-muted-foreground">
              You can always update these details later in your profile settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

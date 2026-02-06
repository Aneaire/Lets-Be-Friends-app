import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import { SingleImageUpload } from '../components/ImageUpload'
import { StorageImage } from '../components/StorageImage'
import { format } from 'date-fns'
import { Heart, Sparkles } from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Loading...</p>
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
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-4">
        <div className="card-elevated rounded-2xl p-8 max-w-md text-center">
          <h1 className="font-heading text-xl font-bold mb-2 text-foreground">Access Denied</h1>
          <p className="text-muted-foreground text-sm">You must be logged in to access this page.</p>
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
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10 animate-fade-up" style={{ animationFillMode: 'both' }}>
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-pink flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Heart className="w-7 h-7 text-white fill-white/30" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Create Your Profile</h1>
          <p className="text-muted-foreground text-sm mt-2">Tell us about yourself to get started</p>
        </div>

        <div className="card-elevated rounded-2xl overflow-hidden">
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-destructive/8 border border-destructive/15 rounded-xl text-sm text-destructive flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-warm w-full"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-warm w-full"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Profile Picture <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <div className="relative">
                      <StorageImage
                        storageId={avatarUrl}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-xl object-cover border border-border"
                      />
                      <button
                        onClick={() => setAvatarUrl('')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm hover:bg-destructive/90 transition-colors"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <img
                      src="/profile-placeholder.svg"
                      alt="Profile placeholder"
                      className="w-20 h-20 rounded-xl border border-border"
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
                <label className="block text-sm font-medium mb-2 text-foreground">Birthday</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="input-warm w-full"
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
                      className="input-warm w-full"
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
                      className="input-warm w-full"
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
                <label className="block text-sm font-medium mb-2 text-foreground">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-warm w-full min-h-[120px] resize-none"
                  placeholder="Tell us about yourself, your interests, what you're looking for..."
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 active:scale-[0.98]"
            >
              {isSaving ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </div>

          <div className="px-6 py-4 bg-foreground/3 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              You can always update these details later in your profile settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

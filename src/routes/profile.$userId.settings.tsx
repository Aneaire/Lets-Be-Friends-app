import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Save, Check, MapPin, Eye, EyeOff } from 'lucide-react'
import { SingleImageUpload } from '../components/ImageUpload'

export const Route = createFileRoute('/profile/$userId/settings')({
  component: ProfileSettings,
})

function ProfileSettings() {
  const { userId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLocationVisible, setIsLocationVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [initialized, setInitialized] = useState(false)

  const updateUserProfile = useConvexMutation(api.users.updateUserProfile)

  useEffect(() => {
    if (currentUser && !initialized) {
      setUsername(currentUser.username ?? '')
      setFullName(currentUser.fullName ?? '')
      setBio(currentUser.bio ?? '')
      setPhoneNumber(currentUser.phoneNumber ?? '')
      setBirthday(currentUser.birthday ?? '')
      setGender(currentUser.gender ?? '')
      setLocation(currentUser.location ?? '')
      setAvatarUrl(currentUser.avatarUrl ?? '')
      setIsLocationVisible(currentUser.isLocationVisible ?? false)
      setInitialized(true)
    }
  }, [currentUser, initialized])

  if (!currentUser || (currentUser._id !== userId && currentUser.clerkId !== userId)) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="card-elevated rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">You can only edit your own profile.</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!clerkUserId) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      await updateUserProfile({
        clerkId: clerkUserId,
        username,
        fullName,
        bio,
        phoneNumber,
        birthday,
        gender,
        location,
        avatarUrl,
        isLocationVisible,
      })

      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch {
      setSaveMessage('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        {/* Back link */}
        <div className="mb-6 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <Link
            to="/profile/$userId"
            params={{ userId }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          Edit Profile
        </h1>

        <div className="card-elevated rounded-2xl p-6 space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {/* Avatar section */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={avatarUrl || '/profile-placeholder.svg'}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-border"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground mb-2">Profile Picture</h3>
              <SingleImageUpload
                defaultImage={avatarUrl}
                onImageChange={(imageId) => setAvatarUrl(imageId ?? '')}
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Username */}
          <FieldGroup label="Username">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-warm w-full"
              placeholder="Enter your username"
            />
          </FieldGroup>

          {/* Full name */}
          <FieldGroup label="Full Name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-warm w-full"
              placeholder="Enter your full name"
            />
          </FieldGroup>

          {/* Bio */}
          <FieldGroup label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-warm w-full min-h-[100px] resize-none"
              placeholder="Tell us about yourself..."
            />
          </FieldGroup>

          {/* Phone + Birthday */}
          <div className="grid sm:grid-cols-2 gap-4">
            <FieldGroup label="Phone Number">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input-warm w-full"
                placeholder="09XX XXX XXXX"
              />
            </FieldGroup>

            <FieldGroup label="Birthday">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="input-warm w-full"
              />
            </FieldGroup>
          </div>

          {/* Gender */}
          <FieldGroup label="Gender">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="input-warm w-full"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </FieldGroup>

          {/* Location */}
          <FieldGroup label="Location">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-warm w-full pl-9"
                placeholder="City, Province"
              />
            </div>
          </FieldGroup>

          {/* Location visibility toggle */}
          <button
            type="button"
            onClick={() => setIsLocationVisible(!isLocationVisible)}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-border transition-colors"
          >
            {isLocationVisible ? (
              <Eye className="h-4 w-4 text-primary" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Nearby search visibility</p>
              <p className="text-xs text-muted-foreground">
                {isLocationVisible ? 'You appear in nearby discovery for other users' : 'You are hidden from nearby search results'}
              </p>
            </div>
            <div className={`w-9 h-5 rounded-full transition-colors ${isLocationVisible ? 'bg-primary' : 'bg-border'} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isLocationVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>

          <div className="h-px bg-border" />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm shadow-primary/20"
          >
            {saveMessage.includes('success') ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </>
            )}
          </button>

          {saveMessage && !saveMessage.includes('success') && (
            <p className="text-sm text-center text-destructive">{saveMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  )
}

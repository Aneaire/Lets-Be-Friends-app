import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Save } from 'lucide-react'
import { SingleImageUpload } from '../components/ImageUpload'

export const Route = createFileRoute('/profile/$userId/settings')({
  component: ProfileSettings,
})

function ProfileSettings() {
  const { userId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })

  const [username, setUsername] = useState(currentUser?.username ?? '')
  const [fullName, setFullName] = useState(currentUser?.fullName ?? '')
  const [bio, setBio] = useState(currentUser?.bio ?? '')
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber ?? '')
  const [birthday, setBirthday] = useState(currentUser?.birthday ?? '')
  const [gender, setGender] = useState(currentUser?.gender ?? '')
  const [location, setLocation] = useState(currentUser?.location ?? '')
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? '')
  const [isLocationVisible, setIsLocationVisible] = useState(currentUser?.isLocationVisible ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const updateUserProfile = useConvexMutation(api.users.updateUserProfile)

  if (!currentUser || currentUser._id !== userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>You can only edit your own profile.</p>
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

      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      setSaveMessage('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/profile/$userId"
            params={{ userId }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Profile
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={avatarUrl || "/profile-placeholder.svg"}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold mb-2">Profile Picture</h3>
              <SingleImageUpload
                defaultImage={avatarUrl}
                onImageChange={(imageId) => setAvatarUrl(imageId ?? '')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="09XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="City, Province"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isLocationVisible"
              checked={isLocationVisible}
              onChange={(e) => setIsLocationVisible(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isLocationVisible" className="text-sm">
              Make my location visible to other users
            </label>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {saveMessage && (
              <p className={`mt-2 text-sm text-center ${
                saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

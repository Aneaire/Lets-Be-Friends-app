import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@clerk/clerk-react'
import {
  User,
  Sparkles,
  AtSign,
  Camera,
  Calendar as CalendarIcon,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { SingleImageUpload } from '../components/ImageUpload'
import { StorageImage } from '../components/StorageImage'
import { Calendar } from '../components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
})

const steps = [
  { id: 1, title: 'Name', icon: User },
  { id: 2, title: 'Username', icon: AtSign },
  { id: 3, title: 'Birthday', icon: CalendarIcon },
  { id: 4, title: 'Bio', icon: FileText },
]

function Onboarding() {
  const { userId: clerkUserId } = useAuth()
  const navigate = useNavigate()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const isOnboardingComplete = currentUser?.isOnboardingComplete ?? false

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [birthday, setBirthday] = useState<Date | undefined>()
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const updateUserProfile = useConvexMutation(api.users.updateUserProfile)

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-card border rounded-2xl shadow-xl p-8">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You must be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        setError('Please enter your name')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!username.trim()) {
        setError('Please enter a username')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!birthday) {
        setError('Please select your birthday')
        return
      }
      setStep(4)
    }
    setError('')
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
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
        birthday: birthday ? format(birthday, 'yyyy-MM-dd') : '',
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

  const currentStepData = steps.find(s => s.id === step)
  const CurrentIcon = currentStepData?.icon || User

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-card/80 backdrop-blur-sm border rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Create Your Profile
                  </h1>
                  <p className="text-sm text-muted-foreground">Step {step} of 4</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              {steps.map((s) => {
                const StepIcon = s.icon
                const isCompleted = s.id < step
                const isCurrent = s.id === step
                const isFuture = s.id > step

                return (
                  <div key={s.id} className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-muted relative">
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
                          isCompleted || isCurrent ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted'
                        )}
                        style={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                      />
                    </div>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-500',
                        isCompleted && 'bg-gradient-to-br from-primary to-secondary text-white',
                        isCurrent && 'bg-gradient-to-br from-primary to-secondary text-white scale-110',
                        isFuture && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-8 pt-6">
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all',
                    'bg-gradient-to-br from-primary/20 to-secondary/20'
                  )}
                >
                  <CurrentIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-1">
                    {currentStepData?.title || 'Step'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {step === 1 && 'Enter your full name to get started'}
                    {step === 2 && 'Choose a unique username for your profile'}
                    {step === 3 && 'Select your birthday to personalize your experience'}
                    {step === 4 && 'Tell others a bit about yourself'}
                  </p>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-0 focus:border-primary transition-all text-lg font-medium"
                      placeholder="John Doe"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <AtSign className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-0 focus:border-primary transition-all text-lg font-medium"
                      placeholder="username"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {avatarUrl ? (
                        <div className="relative group">
                          <StorageImage
                            storageId={avatarUrl}
                            alt="Avatar preview"
                            className="w-28 h-28 rounded-2xl object-cover border-4 border-primary/20 shadow-xl"
                          />
                          <button
                            onClick={() => setAvatarUrl('')}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                          >
                            <span className="text-lg font-bold">×</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-muted-foreground font-bold text-4xl border-4 border-dashed border-muted-foreground/30">
                          {fullName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Camera className="h-4 w-4 text-primary" />
                        <span>Profile Picture</span>
                        <span className="text-muted-foreground text-xs">(Optional)</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add a photo to help others recognize you
                      </p>
                      <SingleImageUpload
                        defaultImage={avatarUrl}
                        onImageChange={(imageId) => setAvatarUrl(imageId ?? '')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Calendar
                    selected={birthday}
                    onSelect={setBirthday}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    className="bg-gradient-to-br from-background to-muted/20 p-6 rounded-2xl border-2"
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <FileText className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-0 focus:border-primary transition-all text-lg min-h-[200px] resize-none font-medium"
                      placeholder="Tell us about yourself, your interests, what you're looking for..."
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Write something interesting about yourself. This will be visible on your profile.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-4 border-2 border-input rounded-xl font-medium hover:bg-accent hover:border-accent transition-all flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Back</span>
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-4 rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-lg"
                >
                  <span>Next</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-4 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>{isSaving ? 'Creating Profile...' : 'Complete Profile'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-muted/30 px-8 py-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              You can always update these details later in your profile settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

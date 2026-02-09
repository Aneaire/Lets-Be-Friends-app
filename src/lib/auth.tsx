import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { ReactNode, ComponentType } from 'react'

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedComponent(props: P): ReactNode {
    const { isSignedIn, isLoaded } = useAuth()
    const navigate = useNavigate()

    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <img src="/screen-logo.svg" alt="Loading..." className="w-32 h-auto" />
        </div>
      )
    }

    if (!isSignedIn) {
      navigate({ to: '/auth/sign-in' })
      return null
    }

    return <Component {...props} />
  }
}

export function withOnboardingComplete<P extends object>(Component: ComponentType<P>) {
  return function OnboardingProtectedComponent(props: P): ReactNode {
    const { isSignedIn, isLoaded, userId } = useAuth()
    const navigate = useNavigate()
    const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: userId ?? '' })

    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <img src="/screen-logo.svg" alt="Loading..." className="w-32 h-auto" />
        </div>
      )
    }

    if (!isSignedIn) {
      navigate({ to: '/auth/sign-in' })
      return null
    }

    if (currentUser?.isOnboardingComplete === false) {
      navigate({ to: '/onboarding' })
      return null
    }

    return <Component {...props} />
  }
}

export function useRequireAuth(): void {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  if (!isLoaded || !isSignedIn) {
    navigate({ to: '/auth/sign-in' })
  }
}

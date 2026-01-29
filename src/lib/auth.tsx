import { redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { ReactNode, ComponentType } from 'react'

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedComponent(props: P): ReactNode {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
      return <div>Loading...</div>
    }

    if (!isSignedIn) {
      throw redirect({
        to: '/auth/sign-in',
      })
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
      return <div>Loading...</div>
    }

    if (!isSignedIn) {
      throw redirect({
        to: '/auth/sign-in',
      })
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

  if (!isLoaded) {
    throw redirect({
      to: '/auth/sign-in',
    })
  }

  if (!isSignedIn) {
    throw redirect({
      to: '/auth/sign-in',
    })
  }
}

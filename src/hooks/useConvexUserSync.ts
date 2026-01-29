import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const useConvexUserSync = () => {
  const { userId, isSignedIn } = useAuth()
  const { user } = useUser()
  const createUser = useMutation(api.users.createUser)

  useEffect(() => {
    if (isSignedIn && userId !== null && userId !== undefined && user) {
      const firstName = user.firstName || ''
      const lastName = user.lastName || ''
      const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : user.username || 'User'

      void createUser({
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        fullName,
      })
    }
  }, [isSignedIn, userId, user, createUser])
}

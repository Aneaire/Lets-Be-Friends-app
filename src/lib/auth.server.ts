import { useAuth } from '@clerk/clerk-react'

export const useGetUser = () => {
  const { userId } = useAuth()

  if (!userId) {
    return null
  }

  return {
    id: userId,
  }
}

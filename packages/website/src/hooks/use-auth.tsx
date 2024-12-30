import { signOut, useSession } from 'next-auth/react'
import { useDisconnect } from 'wagmi'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const hasUserOnBoarded =
    session?.user && (!session.user.username || !session.user.email)
  const { disconnectAsync } = useDisconnect()
  const logOut = async () => {
    await disconnectAsync?.()
    await signOut()
  }
  return {
    session,
    hasUserOnBoarded,
    status,
    logOut,
  }
}

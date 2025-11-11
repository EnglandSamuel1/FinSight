import { redirect } from 'next/navigation'
import { getCurrentUser } from './middleware'

/**
 * Require authentication for server components
 * Redirects to login page if user is not authenticated
 * 
 * @param redirectTo - Optional redirect path (default: '/login')
 * @returns User object if authenticated
 */
export async function requireAuthServer(redirectTo = '/login') {
  const user = await getCurrentUser()

  if (!user) {
    redirect(redirectTo)
  }

  return user
}

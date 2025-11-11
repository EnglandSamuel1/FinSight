import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Creates a Supabase client for client-side use with cookie-based session management.
 * This ensures cookies are set that the server can read for authentication.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

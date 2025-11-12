import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only validate environment variables when actually creating the client
// This allows the landing page to build without Supabase configuration
function getSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!supabaseAnonKey) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Creates a Supabase client for client-side use with cookie-based session management.
 * This ensures cookies are set that the server can read for authentication.
 * Only creates the client when accessed, allowing builds without env vars.
 */
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null as any

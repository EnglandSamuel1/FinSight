'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signup: (email: string, password: string) => Promise<{ error?: string }>
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signup = async (email: string, password: string) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { error: 'Invalid email format' }
      }

      // Validate password requirements (minimum 8 characters)
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long' }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Check if error is due to email already existing
        if (
          error.message.includes('already registered') ||
          error.message.includes('already exists') ||
          error.message.includes('User already registered')
        ) {
          return { error: 'Email already registered' }
        }

        return { error: error.message || 'Signup failed' }
      }

      // Session will be updated via onAuthStateChange
      return {}
    } catch (error) {
      console.error('[ERROR] Signup error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // Validate input
      if (!email || !password) {
        return { error: 'Email and password are required' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: 'Invalid email or password' }
      }

      // Session will be updated via onAuthStateChange
      return {}
    } catch (error) {
      console.error('[ERROR] Login error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
    } catch (error) {
      console.error('[ERROR] Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

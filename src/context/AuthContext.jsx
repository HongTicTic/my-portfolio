import { useEffect, useState } from 'react'
import {
  isSupabaseConfigured,
  missingSupabaseConfigError,
  supabase,
} from '../lib/supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp: (email, password) =>
      isSupabaseConfigured
        ? supabase.auth.signUp({ email, password })
        : Promise.resolve({ data: null, error: missingSupabaseConfigError }),
    signIn: (email, password) =>
      isSupabaseConfigured
        ? supabase.auth.signInWithPassword({ email, password })
        : Promise.resolve({ data: null, error: missingSupabaseConfigError }),
    signOut: () =>
      isSupabaseConfigured
        ? supabase.auth.signOut()
        : Promise.resolve({ error: missingSupabaseConfigError }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


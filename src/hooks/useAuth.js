import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { setUser, setLoading, setError, logout } from '../store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading, error } = useSelector(state => state.auth)

  const initializeAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true))
      
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      dispatch(setUser(session?.user || null))

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        dispatch(setUser(session?.user || null))
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      dispatch(setError(error.message))
    }
  }, [dispatch])

  const signIn = useCallback(async (email, password) => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      dispatch(setError(error.message))
      throw error
    }
  }, [dispatch])

  const signUp = useCallback(async (email, password) => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    } catch (error) {
      dispatch(setError(error.message))
      throw error
    }
  }, [dispatch])

  const signOut = useCallback(async () => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      dispatch(logout())
    } catch (error) {
      dispatch(setError(error.message))
    }
  }, [dispatch])

  return {
    user,
    isAuthenticated,
    loading,
    error,
    initializeAuth,
    signIn,
    signUp,
    signOut,
  }
}

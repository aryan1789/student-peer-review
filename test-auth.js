// Quick test to check if authentication is working
import { supabase } from './src/utils/supabaseClient.js'

async function testAuth() {
  console.log('Testing authentication...')
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
    } else {
      console.log('Current session:', session ? 'Logged in' : 'Not logged in')
      if (session) {
        console.log('User:', session.user.email)
      }
    }

    // Test if we can access the auth API
    console.log('\nTesting auth API connection...')
    const { error: healthError } = await supabase.auth.getUser()
    
    if (healthError) {
      console.error('Auth API error:', healthError)
    } else {
      console.log('Auth API is accessible')
    }

  } catch (err) {
    console.error('Auth test failed:', err)
  }
}

testAuth()

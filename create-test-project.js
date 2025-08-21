// Create test project with user data
import { supabase } from './src/utils/supabaseClient.js'

async function createTestProject() {
  console.log('Creating test project...')
  
  // First, let's check if we have any users in the system
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      console.log('No user logged in. You need to sign up/login first.')
      
      // Create a test user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (authError) {
        console.error('Error creating test user:', authError)
        return
      }
      
      console.log('Test user created')
    } else {
      console.log('Current user:', session.user.email)
    }

    // Get current session again
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    
    if (currentSession?.user) {
      // Create a test project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: 'Test Project - User Display',
          description: 'This is a test project to check if user names display correctly on project cards.',
          tags: ['test', 'user-display'],
          user_id: currentSession.user.id
        }])
        .select()
      
      if (projectError) {
        console.error('Error creating test project:', projectError)
      } else {
        console.log('Test project created successfully!', project)
        
        // Check if profile was created
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
        
        if (profileError) {
          console.log('No profile found, creating one...')
          
          const { data: newProfile, error: createProfileError } = await supabase
            .from('profiles')
            .insert([{
              id: currentSession.user.id,
              email: currentSession.user.email,
              full_name: 'Test User',
              avatar_url: null
            }])
            .select()
          
          if (createProfileError) {
            console.error('Error creating profile:', createProfileError)
          } else {
            console.log('Profile created:', newProfile)
          }
        } else {
          console.log('Profile exists:', profile)
        }
      }
    }
  } catch (err) {
    console.error('Test failed:', err)
  }
}

createTestProject()

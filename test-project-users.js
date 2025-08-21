// Quick test to check project user data
import { supabase } from './src/utils/supabaseClient.js'

async function testProjectUsers() {
  console.log('Testing project user data...')
  
  // Get a few projects
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .limit(3)
    
    if (error) {
      console.error('Error fetching projects:', error)
      return
    }
    
    console.log('Projects found:', projects?.length || 0)
    
    if (projects && projects.length > 0) {
      projects.forEach((project, index) => {
        console.log(`\nProject ${index + 1}:`)
        console.log('- Title:', project.title)
        console.log('- User ID:', project.user_id)
        console.log('- Has user_id:', !!project.user_id)
      })
      
      // Try to get profiles for these users
      const userIds = projects.map(p => p.user_id).filter(Boolean)
      if (userIds.length > 0) {
        console.log('\nChecking profiles for user IDs:', userIds)
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        } else {
          console.log('Profiles found:', profiles?.length || 0)
          profiles?.forEach(profile => {
            console.log(`Profile: ${profile.full_name || profile.email || profile.id}`)
          })
        }
      }
    }
  } catch (err) {
    console.error('Test failed:', err)
  }
}

testProjectUsers()

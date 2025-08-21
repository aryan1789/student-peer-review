import { supabase } from './src/utils/supabaseClient.js'

// Test database connection and check projects
async function testDatabase() {
  console.log('Testing database connection...')
  
  try {
    // Check if we can connect
    const { data: session } = await supabase.auth.getSession()
    console.log('Session:', session)
    
    // List all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names') // This might not work, but let's try
      
    if (tablesError) {
      console.log('Cannot list tables:', tablesError)
    } else {
      console.log('Tables:', tables)
    }
    
    // Try to fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5)
    
    if (projectsError) {
      console.error('Projects error:', projectsError)
    } else {
      console.log('Projects found:', projects?.length || 0)
      console.log('First project:', projects?.[0])
    }
    
    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log('Profiles error (might not exist):', profilesError.code)
    } else {
      console.log('Profiles table exists, found:', profiles?.length || 0)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testDatabase()

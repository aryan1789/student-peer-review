// Quick test to check if database tables exist
import { supabase } from './src/utils/supabaseClient.js'

async function testTables() {
  console.log('Testing database tables...')
  
  // Test if comments table exists
  try {
    const { data: commentsTest, error: commentsError } = await supabase
      .from('comments')
      .select('count')
      .limit(1)
    
    if (commentsError) {
      console.log('❌ Comments table:', commentsError.message)
      if (commentsError.code === '42P01') {
        console.log('   Table does not exist!')
      }
    } else {
      console.log('✅ Comments table exists')
    }
  } catch (err) {
    console.log('❌ Comments table error:', err.message)
  }
  
  // Test if likes table exists
  try {
    const { data: likesTest, error: likesError } = await supabase
      .from('likes')
      .select('count')
      .limit(1)
    
    if (likesError) {
      console.log('❌ Likes table:', likesError.message)
      if (likesError.code === '42P01') {
        console.log('   Table does not exist!')
      }
    } else {
      console.log('✅ Likes table exists')
    }
  } catch (err) {
    console.log('❌ Likes table error:', err.message)
  }
  
  // Test projects table (should exist)
  try {
    const { data: projectsTest, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (projectsError) {
      console.log('❌ Projects table:', projectsError.message)
    } else {
      console.log('✅ Projects table exists')
    }
  } catch (err) {
    console.log('❌ Projects table error:', err.message)
  }
}

testTables()

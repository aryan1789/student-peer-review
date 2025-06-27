import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtxhhedrdpdnipmyoysn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eGhoZWRyZHBkbmlwbXlveXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTAxMzgsImV4cCI6MjA2NjM4NjEzOH0.O3jY0hjmbieX33kGEiRMP6SSmKtlp0g9C5_ccEg3hzU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

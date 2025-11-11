import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const supabaseUrl = 'https://rwtreggdczvoovddygxs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dHJlZ2dkY3p2b292ZGR5Z3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2NzI1ODcsImV4cCI6MjAzNDI0ODU4N30.R5cIM8s_sAfXm-mubP-2d4QKHeE4xY1y3-3v2gIq93c'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)
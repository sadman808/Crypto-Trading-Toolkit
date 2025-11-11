import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const supabaseUrl = 'https://pbqomumotsswrpbgaxud.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicW9tdW1vdHNzd3JwYmdheHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQ4ODQ0OTUsImV4cCI6MTk4MDQ2MDQ5NX0.9e20mK0G4a9u28hK262-1i2tY_G2zE-ZzOK8qKHiT2g'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)
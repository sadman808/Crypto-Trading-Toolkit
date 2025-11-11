import { createClient } from '@supabase/supabase-js';

// The Supabase URL and public API key.
const supabaseUrl = 'https://rwtreggdczvoovddygxs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dHJlZ2dkY3p2b292ZGR5Z3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTI1NTQsImV4cCI6MjA3ODQyODU1NH0.QLjueyKy6omVtMEXVappwmoUi8qLydbnm7K1GvR0VcU';

// The 'supabase' object is your connection to the database.
// It's exported and used throughout the app to interact with your data.
export const supabase = createClient(supabaseUrl, supabaseKey);

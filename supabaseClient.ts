import { createClient } from '@supabase/supabase-js';

// These values are provided via the prompt.
// In a production application, they should be stored securely as environment variables.
const supabaseUrl = 'https://rwtreggdczvoovddygxs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dHJlZ2dkY3p2b292ZGR5Z3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTI1NTQsImV4cCI6MjA3ODQyODU1NH0.QLjueyKy6omVtMEXVappwmoUi8qLydbnm7K1GvR0VcU';

export const supabase = createClient(supabaseUrl, supabaseKey);

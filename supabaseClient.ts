import { createClient } from '@supabase/supabase-js';

// The Supabase URL and public API key.
const supabaseUrl = 'https://rwtreggdczvoovddygxs.supabase.co';
const supabaseKey = 'sb_publishable_bzjJyYo6IN_xTK2WtjatLA_t-jRAasn';

// The 'supabase' object is your connection to the database.
// It's exported and used throughout the app to interact with your data.
export const supabase = createClient(supabaseUrl, supabaseKey);
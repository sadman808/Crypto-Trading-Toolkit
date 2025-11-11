import { createClient } from "@supabase/supabase-js";

// --- SUPABASE CLIENT SETUP ---
// IMPORTANT: You must replace these placeholder values with your own Supabase project's URL and Anon Key.
// You can find these in your Supabase project dashboard under Settings > API.
// 1. Go to your Supabase project.
// 2. Navigate to the "API" section in the settings.
// 3. Copy the "Project URL" and the "anon" "public" key.
// 4. Paste them here.

const supabaseUrl = 'https://rwtreggdczvoovddygxs.supabase.co';
const supabaseKey = 'sb_publishable_bzjJyYo6IN_xTK2WtjatLA_t-jRAasn';

// A non-configured client will result in connection errors.
if (supabaseUrl.includes('YOUR_PROJECT_URL') || supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    const errorMessage = "Supabase client is not configured. Please update `supabaseClient.ts` with your project's URL and anon key from your Supabase project settings.";
    // Display error in the console
    console.error(errorMessage);
    // Optionally, you could throw an error to halt execution
    // throw new Error(errorMessage);
}


export const supabase = createClient(supabaseUrl, supabaseKey);
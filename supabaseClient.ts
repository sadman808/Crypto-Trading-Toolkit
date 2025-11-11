import { createClient, SupabaseClient } from "@supabase/supabase-js";

// --- SUPABASE CLIENT SETUP ---
// To enable cloud storage and user authentication, replace these with your Supabase project's URL and Anon Key.
// You can find these in your Supabase project dashboard under Settings > API.
const supabaseUrl = 'https://rwtreggdczvoovddygxs.supabase.co';
const supabaseKey = 'sb_publishable_bzjJyYo6IN_xTK2WtjatLA_t-jRAasn';

export const isSupabaseConfigured = !supabaseUrl.includes('YOUR_PROJECT_URL') && !supabaseKey.includes('YOUR_SUPABASE_ANON_KEY');

let supabase: SupabaseClient;

if (isSupabaseConfigured) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        console.error("Invalid Supabase URL. Please check your configuration in `supabaseClient.ts`.", error);
        // Create a dummy client to prevent app from crashing if URL is malformed but placeholders are removed.
        supabase = createClient('http://localhost:54321', 'dummy-key');
    }
} else {
    console.warn("Supabase is not configured. The app is running in local-only mode. All data will be stored in your browser's local storage. To enable cloud sync and authentication, update `supabaseClient.ts` with your project credentials.");
    
    // Create a non-functional mock client for local-only mode.
    // This ensures no calls are made and prevents errors if some code path still tries to access supabase.
    const mockClient: any = {
        from: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
            insert: () => Promise.resolve({ data: [], error: null }),
            update: () => Promise.resolve({ data: [], error: null }),
            upsert: () => Promise.resolve({ data: [], error: null }),
            delete: () => Promise.resolve({ data: [], error: null }),
        }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: () => Promise.resolve({ error: { message: "Supabase not configured. Cannot sign in." } }),
            signUp: () => Promise.resolve({ error: { message: "Supabase not configured. Cannot sign up." } }),
            signOut: () => Promise.resolve({ error: null }),
        }
    };
    supabase = mockClient as SupabaseClient;
}

export { supabase };
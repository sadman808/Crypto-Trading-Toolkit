import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://rwtreggdczvoovddygxs.supabase.co';
const supabaseKey = 'sb_publishable_bzjJyYo6IN_xTK2WtjatLA_t-jRAasn';

export const supabase = createClient(supabaseUrl, supabaseKey);

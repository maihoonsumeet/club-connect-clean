// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// These are pulled from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is not configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

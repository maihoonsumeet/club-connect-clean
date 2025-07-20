import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Replace with your own Supabase project URL and anon key
const supabaseUrl = import.meta.env.'https://adlsogvfwodfjoxtothk.supabase.co';
const supabaseAnonKey = import.meta.env.'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbHNvZ3Zmd29kZmpveHRvdGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDc0OTEsImV4cCI6MjA2ODA4MzQ5MX0.4IksHxCoEG_SLENrkXja6C9eEjD6YD7ETq5b5sln-XQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


if (!supabaseUrl || supabaseUrl.includes('https://adlsogvfwodfjoxtothk.supabase.co')) {
  console.error("Supabase URL is not configured. Please add it to src/supabaseClient.ts");
}

if (!supabaseAnonKey || supabaseAnonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbHNvZ3Zmd29kZmpveHRvdGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDc0OTEsImV4cCI6MjA2ODA4MzQ5MX0.4IksHxCoEG_SLENrkXja6C9eEjD6YD7ETq5b5sln-XQ')) {
    console.error("Supabase anon key is not configured. Please add it to src/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

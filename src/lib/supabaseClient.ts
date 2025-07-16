import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adlsogvfwodfjoxtothk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbHNvZ3Zmd29kZmpveHRvdGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDc0OTEsImV4cCI6MjA2ODA4MzQ5MX0.4IksHxCoEG_SLENrkXja6C9eEjD6YD7ETq5b5sln-XQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

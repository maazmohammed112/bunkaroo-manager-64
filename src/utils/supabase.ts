import { createClient } from '@supabase/supabase-js';

// Default project Supabase credentials so production deployments (Vercel, Netlify, Cloudflare, etc.)
// run smoothly out-of-the-box even if environment variables are not configured in the host dashboard.
const DEFAULT_SUPABASE_URL = 'https://kzeylnwysxxhtxrzgrfc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6ZXlsbnd5c3h4aHR4cnpncmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NzgzMDUsImV4cCI6MjA2MzU1NDMwNX0.9IEacjBn4Bk3QxYB1xQlfDHiMuXZCTfpjQrE8dd9usk';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.trim() !== '')
  ? import.meta.env.VITE_SUPABASE_URL
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.trim() !== '')
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

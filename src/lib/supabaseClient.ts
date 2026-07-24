import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjcepgehqhuunnzqpmxf.supabase.co';
const supabaseUrl = rawSupabaseUrl.startsWith('http://') || rawSupabaseUrl.startsWith('https://')
  ? rawSupabaseUrl
  : `https://${rawSupabaseUrl}`;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2VwZ2VocWh1dW5uenFwbXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTAxNDIsImV4cCI6MjA5OTQyNjE0Mn0._IWnRCqi4kTr7XZH87MxJPBJNMUsOUMfiw6I4oqgOnw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

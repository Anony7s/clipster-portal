
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hjhqlxtpugoebbjpkraq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHFseHRwdWdvZWJianBrcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDM3MjEsImV4cCI6MjA1ODk3OTcyMX0.GLfXpar06e0Lf-5cb36yOAZvwEYpD3La-jl2yZsxwi8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: {
    // Disable automatic notifications when switching tabs
    fetch: (url, options) => fetch(url, options)
  }
});

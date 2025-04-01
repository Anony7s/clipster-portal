
export type { Database } from '@/integrations/supabase/types';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types'; 

// Create a helper for typed Supabase calls
export type TypedSupabaseClient = ReturnType<typeof createTypedSupabaseClient>;

export function createTypedSupabaseClient() {
  const supabaseUrl = "https://hjhqlxtpugoebbjpkraq.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHFseHRwdWdvZWJianBrcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDM3MjEsImV4cCI6MjA1ODk3OTcyMX0.GLfXpar06e0Lf-5cb36yOAZvwEYpD3La-jl2yZsxwi8";
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      fetch: (url, options) => fetch(url, options)
    }
  });
}

// Create a new instance of the typed client
export const typedSupabase = createTypedSupabaseClient();


import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

// Extend the auto-generated types with our custom types
export interface Database extends GeneratedDatabase {
  public: {
    Tables: GeneratedDatabase['public']['Tables'] & {
      // Add images table definition
      images: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string;
          user_id: string;
          type: string;
          tags: string[] | null;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url: string;
          user_id: string;
          type?: string;
          tags?: string[] | null;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          image_url?: string;
          user_id?: string;
          type?: string;
          tags?: string[] | null;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "images_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Add saved_images table definition
      saved_images: {
        Row: {
          id: string;
          user_id: string;
          image_id: string;
          image_url: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_id: string;
          image_url: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_id?: string;
          image_url?: string;
          title?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_images_image_id_fkey";
            columns: ["image_id"];
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_images_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Add image_likes table definition
      image_likes: {
        Row: {
          id: string;
          user_id: string;
          image_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "image_likes_image_id_fkey";
            columns: ["image_id"];
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "image_likes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Extend profiles table definition with bio and website fields
      profiles: GeneratedDatabase['public']['Tables']['profiles'] & {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: GeneratedDatabase['public']['Functions'] & {
      // Add the increment_image_likes function
      increment_image_likes: {
        Args: {
          image_id: string;
        };
        Returns: undefined;
      };
      // Add the decrement_image_likes function
      decrement_image_likes: {
        Args: {
          image_id: string;
        };
        Returns: undefined;
      };
      // Add the get_user_total_likes function
      get_user_total_likes: {
        Args: {
          user_id: string;
        };
        Returns: {
          total_likes: number;
        }[];
      };
    };
  };
};

// Create a helper for typed Supabase calls
export type TypedSupabaseClient = ReturnType<typeof createTypedSupabaseClient>;

import { createClient } from '@supabase/supabase-js';

export function createTypedSupabaseClient() {
  const supabaseUrl = "https://hjhqlxtpugoebbjpkraq.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHFseHRwdWdvZWJianBrcmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDM3MjEsImV4cCI6MjA1ODk3OTcyMX0.GLfXpar06e0Lf-5cb36yOAZvwEYpD3La-jl2yZsxwi8";
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      fetch: function(...args) { return fetch(...args); }
    }
  });
}

// Create a new instance of the typed client
export const typedSupabase = createTypedSupabaseClient();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Type helper for database
export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: RecipeRow;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
      };
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      favorites: {
        Row: FavoriteRow;
        Insert: FavoriteInsert;
        Update: FavoriteUpdate;
      };
      recipe_notes: {
        Row: RecipeNoteRow;
        Insert: RecipeNoteInsert;
        Update: RecipeNoteUpdate;
      };
    };
  };
};

// Database types will be generated from schema
type RecipeRow = any;
type RecipeInsert = any;
type RecipeUpdate = any;
type UserRow = any;
type UserInsert = any;
type UserUpdate = any;
type FavoriteRow = any;
type FavoriteInsert = any;
type FavoriteUpdate = any;
type RecipeNoteRow = any;
type RecipeNoteInsert = any;
type RecipeNoteUpdate = any;

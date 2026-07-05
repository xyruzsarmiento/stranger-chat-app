import { createClient } from "@supabase/supabase-js";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export function createBrowserSupabaseClient() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

// Server-side client with service role (use only in API routes / server actions)
export function createServerSupabaseClient() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; username: string; created_at: string };
        Insert: { id?: string; email: string; username: string };
        Update: { username?: string };
      };
      profiles: {
        Row: { id: string; user_id: string; bio: string; country: string; avatar_url: string; interests: string[] };
        Insert: { user_id: string; bio?: string; country?: string; avatar_url?: string; interests?: string[] };
        Update: { bio?: string; country?: string; avatar_url?: string; interests?: string[] };
      };
      reports: {
        Row: { id: string; reporter_id: string; reported_id: string; reason: string; created_at: string };
        Insert: { reporter_id: string; reported_id: string; reason: string };
        Update: never;
      };
      bans: {
        Row: { id: string; user_id: string; reason: string; expires_at: string; created_at: string };
        Insert: { user_id: string; reason: string; expires_at?: string };
        Update: never;
      };
    };
  };
};

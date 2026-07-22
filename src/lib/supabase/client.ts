import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./config";

let cached: SupabaseClient | null = null;

/**
 * Loads the Supabase browser client on demand.
 *
 * The import is dynamic so supabase-js stays out of the initial bundle — see
 * the note in ./config. Call this inside submit handlers, never at module
 * scope or during render.
 */
export async function getSupabase(): Promise<SupabaseClient> {
  if (cached) return cached;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or guard the call with isSupabaseConfigured."
    );
  }

  const { createBrowserClient } = await import("@supabase/ssr");
  cached = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cached;
}

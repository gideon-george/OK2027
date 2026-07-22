const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when a Supabase project has been provisioned and wired up.
 *
 * Deliberately in its own module with no SDK import: components check this at
 * render time, and pulling supabase-js into that path would put ~150 kB of
 * JavaScript on the critical path of every form page. Members are on metered
 * data over patchy networks — the client is loaded on submit instead, via
 * getSupabase().
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;

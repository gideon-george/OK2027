import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Call this fresh in every Server Component / Route Handler / Server Action
// that needs Supabase -- it reads the current request's cookies, so it can't
// be created once and reused across requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies. Safe to ignore here as
            // long as session refresh happens in middleware (not yet added).
          }
        },
      },
    }
  );
}

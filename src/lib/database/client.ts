import { createClient, type SupabaseClient } from "@supabase/supabase-js";
export const mode =
  process.env.NEXT_PUBLIC_DATA_MODE === "cloud" ? "cloud" : "local";
let client: SupabaseClient | undefined;
export function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw Error(
      "Cloud mode requires Supabase URL and anonymous key. Configure .env.local and restart.",
    );
  return (client ??= createClient(url, key));
}

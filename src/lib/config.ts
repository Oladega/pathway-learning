import { z } from "zod";
export function validateEnvironment(env: Record<string, string | undefined>) {
  const mode = z
    .enum(["local", "cloud"])
    .default("local")
    .parse(env.NEXT_PUBLIC_DATA_MODE);
  if (mode === "cloud") {
    z.string().url().parse(env.NEXT_PUBLIC_SUPABASE_URL);
    z.string().min(10).parse(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  return {
    mode,
    mentor: !!env.OPENAI_API_KEY,
    accountDeletion: !!env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

import { z } from "zod";
const mode = z
  .enum(["local", "cloud"])
  .default("local")
  .parse(process.env.NEXT_PUBLIC_DATA_MODE);
if (mode === "cloud") {
  z.string().url().parse(process.env.NEXT_PUBLIC_SUPABASE_URL);
  z.string().min(10).parse(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
export default {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: { cpus: 2 },
};

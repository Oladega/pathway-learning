import { createClient } from "@supabase/supabase-js";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function authorized(request: Request) {
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "cloud")
    throw new HttpError(503, "Cloud persistence is not enabled");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bearer = request.headers.get("Authorization");
  if (!bearer?.startsWith("Bearer "))
    throw new HttpError(401, "Sign in required");
  if (!url || !key) throw new HttpError(503, "Supabase is not configured");
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: bearer } },
  });
  const { data, error } = await db.auth.getUser(bearer.slice(7));
  if (error || !data.user)
    throw new HttpError(401, "Invalid or expired session");
  return { db, user: data.user };
}
export function apiError(e: unknown) {
  return Response.json(
    {
      error:
        e instanceof HttpError
          ? e.message
          : e instanceof Error && e.name === "ZodError"
            ? "Invalid request data"
            : "Operation failed. Please retry.",
    },
    { status: e instanceof HttpError ? e.status : 400 },
  );
}
export async function boundedJson(request: Request, max = 5_000_000) {
  const declared = Number(request.headers.get("Content-Length") ?? 0);
  if (declared > max) throw new HttpError(413, "Request is too large");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Missing request body");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > max) {
      await reader.cancel();
      throw new HttpError(413, "Request is too large");
    }
    chunks.push(value);
  }
  const raw = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    raw.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(raw));
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}

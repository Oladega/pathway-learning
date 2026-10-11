import { createClient } from "@supabase/supabase-js";
import {
  authorized,
  apiError,
  HttpError,
  boundedJson,
} from "../../../lib/database/server";
export async function DELETE(request: Request) {
  try {
    const { user } = await authorized(request);
    const input = await boundedJson(request, 1000);
    if (input.confirmation !== "DELETE")
      throw new HttpError(400, "Explicit confirmation required");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key)
      throw new HttpError(
        503,
        "Account deletion requires server-side administrator configuration",
      );
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw new HttpError(500, "Account deletion failed");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

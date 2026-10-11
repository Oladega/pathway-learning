import {
  authorized,
  apiError,
  boundedJson,
  HttpError,
} from "../../../lib/database/server";
import { stateSchema } from "../../../lib/schema";
export async function GET(request: Request) {
  try {
    const { db } = await authorized(request);
    const { data, error } = await db.rpc("load_learning_state");
    if (error)
      throw new HttpError(
        500,
        "Unable to load cloud records. Check migrations.",
      );
    return Response.json(
      { state: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function PUT(request: Request) {
  try {
    const { db } = await authorized(request);
    const state = stateSchema.parse(await boundedJson(request));
    const { data, error } = await db.rpc("save_learning_state", {
      document: state,
      expected_revision: state.revision,
    });
    if (error)
      throw new HttpError(
        error.message.includes("revision conflict") ? 409 : 500,
        error.message.includes("revision conflict")
          ? "Your cloud data changed in another tab. Reload before saving."
          : "Cloud save failed. Check migrations and permissions.",
      );
    return Response.json({ state: data });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    const { db } = await authorized(request);
    const { error } = await db.rpc("delete_learning_state");
    if (error) throw new HttpError(500, "Cloud deletion failed");
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}

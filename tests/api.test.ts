import { describe, it, expect, vi, afterEach } from "vitest";
import { authorized, HttpError } from "../src/lib/database/server";
import { validateEnvironment } from "../src/lib/config";
import { OpenAIMentor } from "../src/lib/ai/provider";
const auth = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: { getUser: auth.getUser } })),
}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe("Verified authorization boundary", () => {
  it("rejects missing, forged and expired bearer identity in cloud mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "cloud");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
    await expect(
      authorized(new Request("http://localhost")),
    ).rejects.toMatchObject({ status: 401 });
    auth.getUser.mockResolvedValue({
      data: { user: null },
      error: Error("Invalid JWT"),
    });
    await expect(
      authorized(
        new Request("http://localhost", {
          headers: { Authorization: "Bearer forged" },
        }),
      ),
    ).rejects.toMatchObject({ status: 401 });
  });
  it("uses server verified user rather than user-supplied parameters", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "cloud");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
    auth.getUser.mockResolvedValue({
      data: { user: { id: "verified-user" } },
      error: null,
    });
    const result = await authorized(
      new Request("http://localhost?user_id=victim", {
        headers: { Authorization: "Bearer valid" },
      }),
    );
    expect(result.user.id).toBe("verified-user");
    expect(auth.getUser).toHaveBeenCalledWith("valid");
  });
  it("validates the explicit cloud/local configuration", () => {
    expect(validateEnvironment({}).mode).toBe("local");
    expect(() =>
      validateEnvironment({ NEXT_PUBLIC_DATA_MODE: "wrong" }),
    ).toThrow();
    expect(() =>
      validateEnvironment({ NEXT_PUBLIC_DATA_MODE: "cloud" }),
    ).toThrow();
    expect(new HttpError(401, "Sign in").status).toBe(401);
  });
});
describe("Mentor provider without paid calls", () => {
  it("uses a server-only key, output limit and verified response shape", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetcher = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: "First hint: inspect the return value." } },
          ],
        }),
      });
    vi.stubGlobal("fetch", fetcher);
    const text = await new OpenAIMentor().answer("Hints only", [
      { role: "user", content: "Help" },
    ]);
    expect(text).toContain("First hint");
    const request = fetcher.mock.calls[0][1];
    expect(request.headers.Authorization).toBe("Bearer test-key");
    expect(JSON.parse(request.body).max_completion_tokens).toBe(1200);
  });
  it("reports provider failure without fabricating a response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(new OpenAIMentor().answer("Hints", [])).rejects.toThrow(
      "unavailable",
    );
  });
});

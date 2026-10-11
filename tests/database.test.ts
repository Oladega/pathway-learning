import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createInitial } from "../src/data/seed";
import { parseBackup } from "../src/lib/schema";
let db: PGlite;
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
async function asUser(id: string) {
  await db.exec(
    `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
  );
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; insert into auth.users values('${a}'),('${b}');`,
  );
  await db.exec(
    readFileSync("supabase/migrations/202610120001_pathway.sql", "utf8"),
  );
  await db.exec(readFileSync("supabase/seed.sql", "utf8"));
}, 30000);
afterAll(async () => {
  await db.close();
});
describe("Actual PostgreSQL migration, persistence and RLS", () => {
  it("seeds the complete catalog with no user achievements", async () => {
    const { rows } = await db.query<{ n: number }>(
      "select count(*)::int n from public.roadmap_weeks",
    );
    expect(rows[0].n).toBe(52);
    const r = await db.query<{ n: number }>(
      "select count(*)::int n from public.study_sessions",
    );
    expect(r.rows[0].n).toBe(0);
  });
  it("atomically saves and reloads a validated state and rejects stale revisions", async () => {
    await asUser(a);
    const state = createInitial("2026-10-12");
    state.onboarded = true;
    const saved = await db.query<{ state: unknown }>(
      "select public.save_learning_state($1::jsonb,0) state",
      [JSON.stringify(state)],
    );
    const result = parseBackup(saved.rows[0].state);
    expect(result.revision).toBe(1);
    expect(result.tasks).toHaveLength(208);
    expect(result.projects).toHaveLength(55);
    await expect(
      db.query("select public.save_learning_state($1::jsonb,0)", [
        JSON.stringify(state),
      ]),
    ).rejects.toThrow("revision conflict");
    const loaded = await db.query<{ state: unknown }>(
      "select public.load_learning_state() state",
    );
    expect(parseBackup(loaded.rows[0].state)).toEqual(result);
  });
  it("another user cannot read, update or insert records owned by the first", async () => {
    await asUser(b);
    expect(
      (await db.query("select * from public.learning_tasks")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select public.load_learning_state() state")).rows,
    ).toEqual([{ state: null }]);
    await db.query(
      "update public.learning_tasks set payload='{}' where user_id=$1",
      [a],
    );
    await expect(
      db.query(
        "insert into public.notes(user_id,id,payload) values($1,'forged','{}')",
        [a],
      ),
    ).rejects.toThrow("row-level security");
    await asUser(a);
    expect(
      (await db.query("select * from public.learning_tasks")).rows,
    ).toHaveLength(208);
  });
  it("rate limits per tenant and denies unauthenticated RPC use", async () => {
    await asUser(b);
    for (let i = 0; i < 6; i++)
      expect(
        (
          await db.query<{ allowed: boolean }>(
            "select public.claim_mentor_request() allowed",
          )
        ).rows[0].allowed,
      ).toBe(true);
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.claim_mentor_request() allowed",
        )
      ).rows[0].allowed,
    ).toBe(false);
    await db.exec("reset role; set role anon;");
    await expect(
      db.query("select public.load_learning_state()"),
    ).rejects.toThrow("permission denied");
  });
  it("checks task ownership references, rolls back failed writes and deletes only caller data", async () => {
    await asUser(a);
    const result = await db.query<{ state: unknown }>(
      "select public.load_learning_state() state",
    );
    const state = parseBackup(result.rows[0].state);
    state.sessions = [
      {
        id: "bad-session",
        date: "2026-10-12",
        duration: 30,
        taskId: "does-not-exist",
        courseLevel: 0,
        subject: "Python",
        learned: "",
        challenges: "",
        confidence: 3,
        assistance: "none",
      },
    ];
    await expect(
      db.query("select public.save_learning_state($1::jsonb,1)", [
        JSON.stringify(state),
      ]),
    ).rejects.toThrow("session_task");
    expect(
      (
        await db.query<{ revision: number }>(
          "select revision::int revision from public.learning_plans",
        )
      ).rows[0].revision,
    ).toBe(1);
    await asUser(b);
    await db.query("select public.delete_learning_state()");
    await asUser(a);
    expect(
      (await db.query("select * from public.learning_tasks")).rows,
    ).toHaveLength(208);
    await db.query("select public.delete_learning_state()");
    expect(
      (await db.query("select * from public.learning_tasks")).rows,
    ).toHaveLength(0);
  });
});

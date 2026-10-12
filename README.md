# Pathway — Personal AI Engineering Learning OS

A Next.js application for a practical 52-week transition from Product Design to AI Engineering. Starts with zero personal achievements and a full curriculum: six phases, 52 weekly projects (six capstones), three portfolio projects, ten course levels with primary/Udemy alternatives and 50 skills.

## Run locally

Requires Node.js 22.17+ and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and complete the six-step onboarding. Default `NEXT_PUBLIC_DATA_MODE=local` needs no credentials. Progress is saved **in this browser**, not an authenticated cloud account. Use Settings → Export JSON regularly. Do not clear browser storage without a backup.

The prior Vite source is retained in `reference/`; the application now uses Next.js. V1 backups are not imported automatically into the stricter v2 schema. Keep any prior backups separately.

## Daily workflows

- Overview → Continue learning → review the external course/topic → mark lesson complete. Course and weighted roadmap progress update and survive reload.
- Roadmap → open a week → review objectives, exercises, assessments, resources and acceptance criteria. Start, pause, complete or reschedule tasks; add links, notes and subtasks.
- Projects → select weekly/phase/portfolio work → complete criteria → add repository and retrospective → complete project → deliberately link skill evidence.
- Planner → start/pause/resume a focus timer → stop → confirm actual minutes and reflection. Timer survives refresh; confirmed sessions drive hours, streaks and analytics. Manual logging, editable weekly schedule and deliberate overdue carry-forward are supported.
- Courses → choose the primary or alternative course and track enrollment/lessons. Changing preference preserves previous work. Trackers are editable Pathway topics, not official course titles or provider synchronization.
- Notes → create Markdown notes using templates, preview, tag, pin and link to learning work. Valid edits autosave. Resources support reading status and notes.
- Skills → self-assess separately from evidence. Career Hub → compare role requirements, record interview practice, manage application board/table and portfolio checklist.
- Cmd/Ctrl+K opens grouped keyboard search. Settings controls profile, theme, weekly targets, schedule-related dates, progress weights, reminders and validated backup import/export.

## Configure Supabase

1. Create a Supabase project. In its SQL Editor, run `supabase/migrations/202610120001_pathway.sql` once, then `supabase/seed.sql`.
2. Set `.env.local`:

```dotenv
NEXT_PUBLIC_DATA_MODE=cloud
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

3. In Supabase Auth, enable email/password authentication. Configure the Site URL for your deployment and email confirmation according to your needs. Restart `npm run dev` after environment changes.
4. Sign up, confirm email if enabled, sign in and onboard. Existing users load their stored plan rather than receiving duplicates.

All tenant-owned tables have RLS. API mutations verify the bearer identity and call transaction-scoped RPCs with expected revisions. No service-role key is required for learning records. Local data is not uploaded automatically; export locally, switch to cloud, sign in/onboard and explicitly import the backup.

Optional server-side `SUPABASE_SERVICE_ROLE_KEY` enables Settings → Delete my account. It is used only by the authenticated account-deletion endpoint, never sent to the browser. Without it, cloud learning-data deletion is available and account identity removal remains an administrator task. Never prefix this key with `NEXT_PUBLIC_`.

For Supabase CLI deployments, link your project, run `supabase db push` for migrations, then execute the committed `supabase/seed.sql` through the SQL Editor or your database client. `npm run seed` regenerates this SQL file from committed curriculum/catalog data; it does not upload or delete cloud data. Use an isolated project for tests and development.

## Configure AI Mentor

Mentor requests require authenticated cloud mode plus a server-side key:

```dotenv
OPENAI_API_KEY=YOUR_KEY
OPENAI_MODEL=gpt-4.1-mini
```

Keep these server-side. Choose an available Chat Completions-compatible model through `OPENAI_MODEL`. Requests use actual authorized learning records, progressive hint modes, persisted conversations, per-user rate limiting and bounded outputs. The API reference is [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create).

Without configuration, sends are disabled; local study guidance and saving debugging drafts to notes continue to work. No fake AI responses are generated. Conversations are saved only after a successful request; notes remain separate and user controlled. AI output is unverified and should be checked against tests/documentation.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Vitest covers curriculum completeness, progress, task transitions, sessions/timers/streaks, persistence/conflicts, import validation, evidence/readiness, API authorization and mocked model behavior. PGlite executes the actual PostgreSQL migration and seed with distinct tenant identities for RLS/transaction tests; no Docker, PostgreSQL server or paid API calls are needed.

Playwright uses installed Google Chrome by default, in an isolated test profile. If you use bundled Chromium, run `npx playwright install chromium` and `PLAYWRIGHT_CHANNEL=chromium npm run test:e2e`. Tests start/reuse the local dev server on port 3000. Do not run dependency installation, dev and production builds against the same `.next` directory simultaneously.

## Production and deployment

```bash
npm run build
npm start
```

Deploy this folder to Vercel as a Next.js project. Use build command `npm run build`, the standard Next.js output, and Node 22+. Add the environment variables in Vercel, configure your Supabase Auth site URL, apply migrations/seed before enabling cloud mode, and redeploy after changing `NEXT_PUBLIC_*` variables. Test signup/confirmation, sign-in, onboarding, reload persistence, per-user isolation and configured mentor errors in the deployed environment.

Local mode also works when deployed, but records remain browser/origin-specific. It does not provide accounts, cross-device synchronization or paid AI requests. Push/email notifications and live course-provider synchronization are not implemented. External course content and credentials are not bundled.

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for stages and verification results, and [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries, tradeoffs and SaaS evolution.

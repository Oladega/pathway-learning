# Pathway architecture

## Application layers

Next.js App Router serves the workspace and authenticated API routes. `src/components/workspace.tsx` owns navigation and lazy feature loading; `src/features/` contains learning, planner, knowledge, growth, career and settings workflows. Reusable accessible controls use Radix dialogs, explicit labels and semantic CSS tokens. Native forms are validated by the same Zod contracts as imported and persisted records.

`src/lib/schema.ts` defines the versioned domain document and referential validation. `src/lib/calculations.ts` contains pure progress, recommendation, date, timer, evidence/readiness and reminder rules. `src/data/curriculum/weeks.json` holds the canonical 52-week curriculum. Course trackers are Pathway-authored topics, not synchronized or official provider lesson titles.

## Single source of truth and persistence

The provider loads data before enabling mutations. Local mode uses the `pathway-v2` localStorage key. Cloud mode loads through `/api/state`; PostgreSQL is canonical. Neither mode falls back silently to the other. Local records are not uploaded automatically when cloud configuration changes; explicit export/import is supported.

Mutations are serialized. Every mutation validates, updates the UI, persists, and rolls back on failure. Revisions detect stale writes in separate tabs/cloud clients; conflicts require reloading rather than overwriting someone else's state. Invalid stored documents remain intact, and a raw recovery download is available. Storage/quota/network errors are surfaced. Browser storage is per origin: development and deployed domains have separate data.

The v1 prototype is preserved in `reference/`. Its coarse week/course checkboxes are not silently migrated into v2 evidence or mastery. Export old records from the old application if needed; keep them as historical backup. V2 imports deliberately reject v1/incomplete documents.

## Database model

Migration `supabase/migrations/202610120001_pathway.sql` creates tenant-owned tables with composite `(user_id,id)` identities, timestamps, indexes, constraints and RLS. Preferences, plans, tasks, lessons, sessions, projects, notes, evidence, resources, jobs, interviews, messages and activity are separate relational collections. Global phases/weeks/course catalog/skills are read-only for application roles. Foreign keys protect session→task and evidence→project references. Each tenant has one learning plan.

Flexible fields are stored in validated JSONB record payloads; commonly constrained or queried relations are generated SQL columns. Lesson sections, learning objectives, project milestones, schedule/preferences, interview attempts and notification state are consolidated into their owning records rather than empty stand-alone tables. This preserves workflows while avoiding unnecessary joins. Curriculum week prerequisites remain canonical seed data.

`save_learning_state` and `delete_learning_state` are transaction-scoped RPCs under the caller's JWT (`SECURITY INVOKER`). An advisory lock plus expected revision protects concurrent updates. Foreign keys are deferred so replacing an aggregate is atomic. No user identifier is accepted from the frontend at the authorization boundary. API routes verify the access token with Supabase Auth; RLS independently enforces tenant ownership.

The aggregate RPC is intentionally a first-version tradeoff. For larger SaaS workspaces, replace whole-document writes with typed per-record commands, pagination, partial subscriptions and transaction-level events behind the same persistence interface. Keep schema migrations and conflict detection. Browser-only Auth SDK sessions work with bearer API routes; server-rendered authenticated pages can later adopt Supabase SSR cookies.

## Learning and evidence semantics

Every seeded week contains a learning task, independent practice task, assessment and project deliverable. Configurable weights total 100 (default 30/40/10/20). Skipped work does not award completion. Recommendations honor prerequisite weeks, paused phases, current focus, scheduled date and priority. All future content is previewable.

Lesson completion updates the tracked course and week's learning tasks. Weekly project completion requires all checklist criteria, repository URL and retrospective, then completes its deliverable. Reopening a project removes that deliverable completion. Portfolio milestones are independent of weekly projects. Linking a completed project creates skill evidence only on a deliberate user action. Evidence does not raise self-assessed proficiency. Readiness is required-skill evidence coverage, not a probability of employment.

Sessions are confirmed records, not elapsed UI state. Timers persist accumulated elapsed seconds plus a running start timestamp; pause/resume and refresh do not depend on background setInterval execution. Dashboard/analytics derive hours and streaks from actual sessions. Dates use Africa/Lagos for the initial user; timezone should move into per-user preferences for wider launch.

## Mentor boundary

The provider interface currently implements OpenAI Chat Completions, with a server-only API key, 12,000-character message limit, bounded HTTP bodies, six requests/minute/user persisted in PostgreSQL, 45-second provider timeout, and 1,200 output-token cap. The prompt derives context from authorized server records and treats pasted documents/code as untrusted data. There are no model tools or consequential writes. Assistance modes guide progressive hints, guided attempts or full explanations. Prompt instructions are mitigations rather than a guarantee against model behavior; outputs remain unverified.

Without an API key, mentor sends are disabled. Local mode also requires moving to authenticated cloud mode before paid AI requests, to avoid an anonymous billed endpoint. Draft-to-note and curriculum-based local guidance remain functional. Provider errors do not create fabricated assistant messages. Live credentials were not available for external verification.

## Security and operations

User content renders as text or React Markdown with raw HTML disabled. Links accept only HTTP(S). Secret keys never enter `NEXT_PUBLIC_*` variables. The optional account-delete route uses the service-role key only after verifying the caller, and deletes that verified identity only. Ordinary data routes use the public key with RLS. In-app reminders work while the application is open; no email/push integration is implied.

Local Postgres-compatible tests use PGlite with auth roles and distinct user identities to execute the actual migration/seed, test transactional writes, FK rollback, RLS isolation, revisions and rate limits. Live Supabase Auth email confirmation, deployed RLS behavior and paid model calls still require environment smoke tests. Before public SaaS launch, add observability, operational backups, password recovery UX, durable audit retention, abuse monitoring, account recovery policy and an independent security/accessibility review.

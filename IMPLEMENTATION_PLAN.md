# Pathway implementation plan

Specification reviewed: entire attached master build prompt, sections 1–34. Existing app: Vite/React prototype, 52 terse week entries, coarse local checkboxes, no backend. Target: Next.js App Router + strict TypeScript, complete curriculum and usable daily workflows before secondary polish. Work stays in this checkout; deployment targets Vercel/Supabase.

## Verification policy

Mark stages complete only after their relevant checks pass. Curriculum is seeded; personal achievements start at zero. Local mode is explicit browser persistence, never presented as cloud authentication. Cloud and paid AI checks requiring credentials are recorded as unverified, with executable integration boundaries and setup instructions. External course topic trackers are authored by Pathway, not official provider lessons or synchronized progress.

## Stage 1 — Foundation and durable model
- [x] Replace Vite entry with Next.js App Router, reusable layout/components, semantic light/dark tokens and all required routes.
- [x] Define validated, versioned domain records and a single persistence adapter boundary; local storage load/save failures must surface without overwriting invalid data.
- [x] Implement local onboarding and authenticated Supabase signup/login/session boundary; cloud mutations authorize the verified current user. Local onboarding and mocked identity tests pass; live Supabase signup/email confirmation remains credential-dependent.
- [x] Add normalized PostgreSQL migration, ownership constraints, RLS, seed strategy and environment validation. Executed the actual migration/seed and RLS tests in PGlite.
Acceptance: strict typecheck; initial data has zero achievements; reload round-trip; invalid import rejected; unauthenticated cloud mutation denied. No duplicate plans after onboarding.

## Stage 2 — Complete curriculum and core learning
- [x] Seed exact 52 weeks in six phases, each with topics, objectives, course mapping, reading, practical exercises, deliverable, criteria, assessments, hours and skills.
- [x] Implement dashboard recommendations, weighted task/week/phase progress, task dependencies and all roadmap views/details.
- [x] Implement 20-course library (10 primary/alternative pairs), choice persistence, enrollment, editable sections/lessons, lesson/task progress and activity.
Acceptance: curriculum completeness/sequence tests; lesson completion updates course and roadmap and persists; course choice preserves completed work; assignments/assessments carry distinct weights; future phases remain previewable.

## Stage 3 — Study productivity
- [x] Planner calendar/agenda/list/history, editable schedule, task editing and deliberate carry-forward.
- [x] Timestamp-based timer start/pause/resume/stop/reset, refresh restoration, confirmation and study-session logging.
- [x] Notes with templates, Markdown preview, tags/pinning/linking/search; editable resource library.
Acceptance: timer math and refresh tests; confirming a session creates exactly one record; actual logged hours update dashboard/analytics; notes survive reload; overdue task rescheduling is explicit.

## Stage 4 — Engineering growth
- [x] Weekly projects, six phase capstones and three detailed portfolio projects with checklists, links, architecture/testing/retrospective.
- [x] Skills matrix, self assessment separate from practical evidence, assistance tracking and skill history.
- [x] Actual-record analytics, seven-day planned/actual chart, history/heatmap/category breakdown and independence metrics.
Acceptance: project completion requires criteria and evidence; related skills can receive evidence without automatic proficiency; empty analytics show zero; calculations covered by tests.

## Stage 5 — Career and mentor
- [x] Seven role requirement sets with evidence-based readiness; interviews/attempts/reviews; job board/table and portfolio checklist.
- [x] Server-side mentor provider abstraction, authorized context, validated requests, limits, modes, persisted conversation and save-to-note. Provider tested with mocked HTTP calls and rate limiter tested in PostgreSQL; paid live calls remain unverified.
- [x] Honest disabled mentor when no API key; deterministic local learning recommendations and in-app reminders.
Acceptance: readiness changes only with appropriate evidence; jobs/interviews persist; no fake AI output; unauthorized/oversized mentor calls fail; configured provider errors surface.

## Stage 6 — Reliability, usability and delivery
- [x] Cmd/Ctrl+K grouped keyboard search; mobile navigation; theme, profile/schedule/weights/notifications settings; validated JSON export/import and confirmed deletion/reset. Optional self-account deletion is implemented behind a server-only administrator key (live deletion unverified).
- [x] Unit/integration tests and Playwright critical workflows (onboarding, lessons, tasks, timer, project, settings/persistence), desktop/mobile QA.
- [x] Typecheck, ESLint, tests, production build; fix all failures.
- [x] README, architecture, exact setup/migration/seed/test/deployment instructions and verified limitations.
Acceptance: all credential-independent checks pass, routes have no dead ends, responsive UI has labels/focus/error feedback; credential-dependent checks explicitly unverified.

## Decisions and constraints
- Preserve old source as reference; no silent conversion of coarse prior completion flags into demonstrated mastery.
- Supabase credentials absent: local persistence is the working alternative; SQL/auth/integration remain independently configurable.
- AI key absent: disabled mentor with saved drafts/notes; no simulated model responses.
- Installation previously hit unavailable transitive caniuse-lite version; fix dependency resolution and commit reproducible lockfile.
- No subprocess agents: work completed sequentially in this checkout.

## Verification log
- Initial review complete; implementation not yet started.

### Development checkpoint
- Strict typecheck, ESLint, production build passed on initial Next.js migration.
- 24 deterministic domain tests passed: curriculum, weighted progress, timers, persistence/conflicts, skill evidence/readiness, import validation and authorization rejection.
- Browser runs verified onboarding/course/lesson/task reload persistence, timer restoration/logging, project completion/evidence and mobile route coverage. Found and fixed queued DOM-event capture and select-label accessibility bugs. Import-validation test selector refined to exclude Next route announcer.
- Upgrading framework and test dependencies after audit advisories. A running dev test server was invalidated by dependency replacement; final clean runs remain pending.
- Cloud signup/live sync and paid model calls remain unverified without service credentials. PostgreSQL/RLS executable integration tests are being added locally.

## Final verification — 12 October 2026

- `npm run typecheck`: passed (strict TypeScript).
- `npm run lint`: passed (ESLint and React Hooks rules).
- `npm test`: **34 passed**, three files, no paid/network model calls. Actual PostgreSQL migration + seed execution, transaction/FK rollback, revision conflict, tenant RLS isolation and six/minute rate limits passed in PGlite.
- `npm run build`: passed on **Next.js 16.4.0**, including framework TypeScript validation and all API routes.
- `npm run test:e2e`: **7 passed against the production server**, covering onboarding, course selection/enrollment, lesson/task completion and reload, timer pause/resume/refresh, confirmed session analytics, project criteria/repository/retrospective/evidence, note autosave, settings/theme, valid and invalid imports, JSON export, mobile routes, disabled mentor, command search, same-route navigation and storage-quota rollback.
- `npm audit`: **0 vulnerabilities** after updating Next.js, Vitest and patched transitive dependencies.
- Visual QA: inspected `artifacts/dashboard-desktop.png`; all personal achievements start at zero. Mobile route overflow checks passed at 390px.
- Local production preview: http://localhost:3000 (opened in Codex).

### Credential-dependent verification and public-launch limits

These checks are not marked verified: live Supabase signup/email confirmation/login, deployed cloud cross-device synchronization, live OpenAI output, and optional Auth account deletion. Their integration boundaries are implemented; configure credentials and follow README smoke-test instructions. PostgreSQL isolation and provider request behavior were verified locally without credentials.

The required local daily learning workflows are implemented and verified. No automatic provider-course synchronization, background push/email notifications, screenshot upload storage, or deployment was fabricated. Screenshot links are supported; external hosting/integrations remain explicitly configured. A public SaaS launch additionally needs operational monitoring/backups, password recovery UX and an independent security/accessibility review, as described in ARCHITECTURE.md. Native semantic forms/CSS tokens and lightweight computed charts were used instead of adding every optional UI/form/chart library.

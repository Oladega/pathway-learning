# Pathway implementation plan

Specification reviewed: entire attached master build prompt, sections 1–34. Existing app: Vite/React prototype, 52 terse week entries, coarse local checkboxes, no backend. Target: Next.js App Router + strict TypeScript, complete curriculum and usable daily workflows before secondary polish. Work stays in this checkout; deployment targets Vercel/Supabase.

## Verification policy

Mark stages complete only after their relevant checks pass. Curriculum is seeded; personal achievements start at zero. Local mode is explicit browser persistence, never presented as cloud authentication. Cloud and paid AI checks requiring credentials are recorded as unverified, with executable integration boundaries and setup instructions. External course topic trackers are authored by Pathway, not official provider lessons or synchronized progress.

## Stage 1 — Foundation and durable model
- [ ] Replace Vite entry with Next.js App Router, reusable layout/components, semantic light/dark tokens and all required routes.
- [ ] Define validated, versioned domain records and a single persistence adapter boundary; local storage load/save failures must surface without overwriting invalid data.
- [ ] Implement local onboarding and authenticated Supabase signup/login/session workflow; cloud mutations authorize the current user.
- [ ] Add normalized PostgreSQL migration, ownership constraints, RLS, seed strategy and environment validation.
Acceptance: strict typecheck; initial data has zero achievements; reload round-trip; invalid import rejected; unauthenticated cloud mutation denied. No duplicate plans after onboarding.

## Stage 2 — Complete curriculum and core learning
- [ ] Seed exact 52 weeks in six phases, each with topics, objectives, course mapping, reading, practical exercises, deliverable, criteria, assessments, hours and skills.
- [ ] Implement dashboard recommendations, weighted task/week/phase progress, task dependencies and all roadmap views/details.
- [ ] Implement 20-course library (10 primary/alternative pairs), choice persistence, enrollment, editable sections/lessons, lesson/task progress and activity.
Acceptance: curriculum completeness/sequence tests; lesson completion updates course and roadmap and persists; course choice preserves completed work; assignments/assessments carry distinct weights; future phases remain previewable.

## Stage 3 — Study productivity
- [ ] Planner calendar/agenda/list/history, editable schedule, task editing and deliberate carry-forward.
- [ ] Timestamp-based timer start/pause/resume/stop/reset, refresh restoration, confirmation and study-session logging.
- [ ] Notes with templates, Markdown preview, tags/pinning/linking/search; editable resource library.
Acceptance: timer math and refresh tests; confirming a session creates exactly one record; actual logged hours update dashboard/analytics; notes survive reload; overdue task rescheduling is explicit.

## Stage 4 — Engineering growth
- [ ] Weekly projects, six phase capstones and three detailed portfolio projects with checklists, links, architecture/testing/retrospective.
- [ ] Skills matrix, self assessment separate from practical evidence, assistance tracking and skill history.
- [ ] Actual-record analytics, seven-day planned/actual chart, history/heatmap/category breakdown and independence metrics.
Acceptance: project completion requires criteria and evidence; related skills can receive evidence without automatic proficiency; empty analytics show zero; calculations covered by tests.

## Stage 5 — Career and mentor
- [ ] Seven role requirement sets with evidence-based readiness; interviews/attempts/reviews; job board/table and portfolio checklist.
- [ ] Server-side mentor provider abstraction, authorized context, validated requests, limits, modes, persisted conversation and save-to-note.
- [ ] Honest disabled mentor when no API key; deterministic local learning recommendations and in-app reminders.
Acceptance: readiness changes only with appropriate evidence; jobs/interviews persist; no fake AI output; unauthorized/oversized mentor calls fail; configured provider errors surface.

## Stage 6 — Reliability, usability and delivery
- [ ] Cmd/Ctrl+K grouped keyboard search; mobile navigation; theme, profile/schedule/weights/notifications settings; validated JSON export/import and confirmed deletion/reset.
- [ ] Unit/integration tests and Playwright critical workflows (onboarding, lessons, tasks, timer, project, settings/persistence), desktop/mobile QA.
- [ ] Typecheck, ESLint, tests, production build; fix all failures.
- [ ] README, architecture, exact setup/migration/seed/test/deployment instructions and verified limitations.
Acceptance: all credential-independent checks pass, routes have no dead ends, responsive UI has labels/focus/error feedback; credential-dependent checks explicitly unverified.

## Decisions and constraints
- Preserve old source as reference; no silent conversion of coarse prior completion flags into demonstrated mastery.
- Supabase credentials absent: local persistence is the working alternative; SQL/auth/integration remain independently configurable.
- AI key absent: disabled mentor with saved drafts/notes; no simulated model responses.
- Installation previously hit unavailable transitive caniuse-lite version; fix dependency resolution and commit reproducible lockfile.
- No subprocess agents: work completed sequentially in this checkout.

## Verification log
- Initial review complete; implementation not yet started.

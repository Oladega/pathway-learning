"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Clock3, Plus } from "lucide-react";
import { useStore } from "../components/provider";
import {
  Header,
  Stat,
  Progress,
  Modal,
  Field,
  Empty,
  str,
  num,
  uuid,
} from "../components/ui";
import { weeks, phases, courses, isoDay, addDays } from "../data/seed";
import {
  weekProgress,
  phaseProgress,
  roadmapProgress,
  weeklyHours,
  streak,
  courseProgress,
  recommendedTask,
  phaseStatus,
  transitionTask,
  completeLesson,
  monday,
} from "../lib/calculations";
import type { Task } from "../lib/schema";
export function Dashboard() {
  const { state, mutate } = useStore(),
    next = recommendedTask(state),
    week = weeks[(next?.week ?? state.preferences.activeWeek) - 1],
    day = isoDay(),
    weekly = weeklyHours(state),
    current = state.preferences.activeWeek;
  return (
    <>
      <Header
        title={`Good ${new Date().getHours() < 12 ? "morning" : "day"}, ${state.preferences.name}`}
        subtitle={`${new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "Africa/Lagos" }).format(new Date())} · Week ${current} · ${weeks[current - 1].phase === "python" ? "Python foundations" : phases.find((p) => p.id === weeks[current - 1].phase)?.name}`}
        actions={
          <Link className="primary" href="/planner">
            + Log study activity
          </Link>
        }
      />
      <div className="stats">
        <Stat
          label="Journey progress"
          value={`${Math.round(roadmapProgress(state))}%`}
          detail={`${state.tasks.filter((t) => t.status === "completed").length} tasks completed`}
        />
        <Stat
          label="Study this week"
          value={`${weekly.toFixed(1)}h`}
          detail={`of ${state.preferences.target} hours planned`}
        />
        <Stat
          label="Learning streak"
          value={`${streak(state)} days`}
          detail="Based on recorded study sessions"
        />
        <Stat
          label="Projects completed"
          value={String(
            state.projects.filter((p) => p.status === "completed").length,
          )}
          detail={`${courses.filter((c) => state.courses[c.level]?.enrolled && courseProgress(state, c.level) < 100).length} courses in progress`}
        />
      </div>
      <section className="continue">
        <div>
          <span className="eyebrow">CONTINUE LEARNING</span>
          <h2>{next ? week.title : "Your scheduled pathway is complete"}</h2>
          <p>{next?.title ?? "Review your portfolio and career evidence."}</p>
          <small>
            {selectedCourse(state, week.courseLevel).title} · {week.hours}h
            weekly plan
          </small>
          <div className="actions">
            <Link
              className="primary"
              href={
                next?.type === "lesson"
                  ? `/courses?lesson=lesson-${week.number}`
                  : `/roadmap?week=${week.number}`
              }
            >
              Continue learning <ArrowUpRight size={16} />
            </Link>
            <Link className="button" href="/planner">
              View weekly plan
            </Link>
            <a
              className="text-link"
              target="_blank"
              rel="noreferrer"
              href={selectedCourse(state, week.courseLevel).url}
            >
              Open course ↗
            </a>
          </div>
        </div>
        <div className="continue-number">
          {String(week.number).padStart(2, "0")}
          <small>CURRENT LEARNING WEEK</small>
        </div>
      </section>
      <div className="two-cols">
        <section className="panel">
          <h2>Today’s tasks</h2>
          <p className="muted">
            Complete practical work, then capture what you learned.
          </p>
          {(["not_started", "in_progress", "paused", "completed"] as const).map(
            (status) => {
              const ts = state.tasks.filter(
                (t) => t.scheduled === day && t.status === status,
              );
              return ts.length ? (
                <div key={status}>
                  <h3>{status.replace("_", " ")}</h3>
                  {ts.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </div>
              ) : null;
            },
          )}
          {!state.tasks.some((t) => t.scheduled === day) && (
            <Empty>
              No tasks scheduled today. Add or schedule work in the planner.
            </Empty>
          )}
          {state.tasks.some(
            (t) =>
              t.scheduled < day && !["completed", "skipped"].includes(t.status),
          ) && (
            <Link href="/planner">
              Review overdue work and adjust your plan →
            </Link>
          )}
        </section>
        <section className="panel">
          <h2>Weekly study rhythm</h2>
          <p className="muted">
            {Math.max(0, state.preferences.target - weekly).toFixed(1)} hours
            remaining · planned vs recorded
          </p>
          <StudyChart />
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>Your six learning phases</h2>
          <Link href="/roadmap">Explore roadmap →</Link>
        </div>
        <div className="phase-grid">
          {phases.map((p, i) => {
            const ws = weeks.filter((w) => w.phase === p.id);
            return (
              <Link
                href={`/roadmap?week=${ws[0].number}`}
                key={p.id}
                className="phase-card"
              >
                <span className="eyebrow">
                  PHASE 0{i + 1} · {phaseStatus(state, p.id)}
                </span>
                <h3>{p.name}</h3>
                <small>
                  {addDays(state.preferences.start, (ws[0].number - 1) * 7)} –{" "}
                  {addDays(state.preferences.start, ws.at(-1)!.number * 7 - 1)}
                </small>
                <Progress value={phaseProgress(state, p.id)} />
                <span>
                  {Math.round(phaseProgress(state, p.id))}% · Next:{" "}
                  {ws.at(-1)!.deliverable}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <div className="two-cols">
        <section className="panel">
          <h2>Upcoming milestones</h2>
          {[8, 16, 24, 32, 40, 52]
            .filter((n) => weekProgress(state, n) < 100)
            .slice(0, 3)
            .map((n) => (
              <Link
                className="list-item"
                href={`/projects?id=week-${n}`}
                key={n}
              >
                <div>
                  <b>{weeks[n - 1].deliverable}</b>
                  <small>
                    Week {n} · {addDays(state.preferences.start, n * 7 - 1)}
                  </small>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))}
        </section>
        <section className="panel">
          <h2>Recent activity</h2>
          {state.activity.length ? (
            state.activity.slice(0, 5).map((a) => (
              <Link className="list-item" href={a.href} key={a.id}>
                <div>
                  <b>{a.title}</b>
                  <small>
                    {new Date(a.at).toLocaleString("en-GB", {
                      timeZone: "Africa/Lagos",
                    })}
                  </small>
                </div>
              </Link>
            ))
          ) : (
            <Empty>
              Your activity will appear as you learn, build and reflect.
            </Empty>
          )}
        </section>
      </div>
      <div className="actions">
        <Link className="button" href="/planner">
          Start a study session
        </Link>
        <Link className="button" href="/notes">
          Add a note
        </Link>
        <button
          onClick={() =>
            mutate(
              (s) => ({
                ...s,
                preferences: { ...s.preferences, activeWeek: next?.week ?? 1 },
              }),
              "Learning focus updated",
            )
          }
        >
          Focus on next available week
        </button>
      </div>
    </>
  );
}
export function StudyChart() {
  const { state } = useStore(),
    start = monday(),
    actual = Array.from({ length: 7 }, (_, i) =>
      state.sessions
        .filter((s) => s.date === addDays(start, i))
        .reduce((sum, s) => sum + s.duration / 60, 0),
    ),
    max = Math.max(1, ...actual, ...state.preferences.schedule);
  return (
    <>
      <div
        className="bar-chart"
        role="img"
        aria-label="Seven day planned and recorded study hours"
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <div className="bar-col" key={d}>
            <div className="bar-pair">
              <span
                className="planned-bar"
                style={{
                  height: `${(state.preferences.schedule[i] / max) * 130}px`,
                }}
                title={`Planned: ${state.preferences.schedule[i]}h`}
              />
              <span
                className="actual-bar"
                style={{ height: `${(actual[i] / max) * 130}px` }}
                title={`Recorded: ${actual[i].toFixed(1)}h`}
              />
            </div>
            <small>{d}</small>
            <small>
              {actual[i].toFixed(1)}h / {state.preferences.schedule[i]}h
            </small>
          </div>
        ))}
      </div>
      <div className="legend">
        <span>▰ Planned</span>
        <span>▰ Recorded</span>
      </div>
    </>
  );
}
export function TaskRow({ task }: { task: Task }) {
  const { state, mutate } = useStore();
  return (
    <div className="task-row">
      <button
        aria-label={`${task.status === "completed" ? "Reset" : "Complete"} ${task.title}`}
        className={`check ${task.status === "completed" ? "checked" : ""}`}
        onClick={() =>
          mutate(
            (s) =>
              transitionTask(
                s,
                task.id,
                task.status === "completed" ? "not_started" : "completed",
              ),
            task.status === "completed" ? "Task reset" : "Task completed",
            `/roadmap?week=${task.week}`,
          )
        }
      >
        {task.status === "completed" && <Check size={14} />}
      </button>
      <Link
        href={
          task.type === "deliverable"
            ? `/projects?id=week-${task.week}`
            : `/roadmap?week=${task.week}`
        }
      >
        <b>{task.title}</b>
        <small>
          {task.type} · {task.estimate / 60}h · {task.priority} priority
          {task.scheduled < isoDay() && task.status !== "completed"
            ? " · overdue"
            : ""}
        </small>
      </Link>
      <select
        aria-label={`Status for ${task.title}`}
        value={task.status}
        disabled={false}
        onChange={(e) => {
          const eventValue = e.target.value;
          mutate(
            (s) => transitionTask(s, task.id, eventValue as Task["status"]),
            "Task status updated",
          );
        }}
      >
        <option value="not_started">Not started</option>
        <option value="in_progress">In progress</option>
        <option value="paused">Paused</option>
        <option value="completed">Completed</option>
        <option value="skipped">Skipped</option>
      </select>
      <span className="sr-only">
        {weekProgress(state, task.week)} percent week complete
      </span>
    </div>
  );
}
export function Roadmap({ selected }: { selected: number }) {
  const { state, mutate } = useStore(),
    [view, setView] = useState("Phase"),
    [filter, setFilter] = useState("all"),
    [q, setQ] = useState(""),
    [open, setOpen] = useState(
      Number.isInteger(selected) && selected >= 1 && selected <= 52
        ? selected
        : 0,
    ),
    [edit, setEdit] = useState<Task | null>(null);
  const active = weeks.find((w) => w.number === open);
  return (
    <>
      <Header
        title="Your learning roadmap"
        subtitle="52 weeks. Six phases. Practical evidence at every step."
      />
      <div className="roadmap-banner">
        <div>
          <span className="eyebrow">FROM PRODUCT DESIGN TO AI ENGINEERING</span>
          <h2>
            Build your next chapter.
            <br />
            One working project at a time.
          </h2>
          <p>
            A flexible learning plan with foundations that build on each other.
          </p>
        </div>
        <strong>
          {Math.round(roadmapProgress(state))}
          <span>% complete</span>
        </strong>
      </div>
      <div className="toolbar">
        <input
          aria-label="Search roadmap"
          placeholder="Search topics or deliverables…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="Filter phase"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All phases</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="tabs">
          {["Timeline", "Phase", "Weekly", "List"].map((v) => (
            <button
              aria-pressed={view === v}
              key={v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className={`roadmap ${view.toLowerCase()}`}>
        {phases
          .filter((p) => filter === "all" || filter === p.id)
          .map((p) => {
            const ws = weeks.filter(
              (w) =>
                w.phase === p.id &&
                `${w.title} ${w.topics.join(" ")} ${w.deliverable}`
                  .toLowerCase()
                  .includes(q.toLowerCase()),
            );
            return ws.length ? (
              <section className="panel" key={p.id}>
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      {p.range} · {phaseStatus(state, p.id)}
                    </span>
                    <h2>{p.name}</h2>
                    <p className="muted">{p.description}</p>
                  </div>
                  <button
                    onClick={() =>
                      mutate(
                        (s) => ({
                          ...s,
                          preferences: {
                            ...s.preferences,
                            pausedPhases: s.preferences.pausedPhases.includes(
                              p.id,
                            )
                              ? s.preferences.pausedPhases.filter(
                                  (x) => x !== p.id,
                                )
                              : [...s.preferences.pausedPhases, p.id],
                          },
                        }),
                        "Phase schedule updated",
                      )
                    }
                  >
                    {state.preferences.pausedPhases.includes(p.id)
                      ? "Resume phase"
                      : "Pause phase"}
                  </button>
                </div>
                <Progress value={phaseProgress(state, p.id)} />
                <div className="week-grid">
                  {ws.map((w) => (
                    <button
                      className="week-card"
                      key={w.number}
                      onClick={() => setOpen(w.number)}
                    >
                      <span className="week-num">
                        {String(w.number).padStart(2, "0")}
                      </span>
                      <div>
                        <b>{w.title}</b>
                        <small>
                          {view === "List"
                            ? w.deliverable
                            : w.topics.join(" · ")}
                        </small>
                        <Progress value={weekProgress(state, w.number)} />
                      </div>
                      <span>{Math.round(weekProgress(state, w.number))}%</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null;
          })}
      </div>
      <Modal
        title={
          active ? `Week ${active.number}: ${active.title}` : "Week details"
        }
        open={!!active}
        onClose={() => setOpen(0)}
      >
        {active && (
          <>
            <p>{active.description}</p>
            <div className="tags">
              <span>{active.hours} hours</span>
              <span>{weekProgress(state, active.number)}% complete</span>
              <span>
                {active.prerequisites.length
                  ? `Prerequisite: week ${active.prerequisites[0]} (preview always available)`
                  : "No prerequisites"}
              </span>
            </div>
            <h3>Learning objectives</h3>
            <ul>
              {active.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <h3>Practice independently</h3>
            <p>{active.exercise}</p>
            <h3>Deliverable: {active.deliverable}</h3>
            <ul>
              {active.criteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Link
              className="primary"
              href={`/projects?id=week-${active.number}`}
            >
              Open project brief →
            </Link>
            <h3>Knowledge check</h3>
            <ol>
              {active.assessment.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
            <h3>Tasks</h3>
            {state.tasks
              .filter((t) => t.week === active.number)
              .map((t) => (
                <div key={t.id}>
                  <TaskRow task={t} />
                  <button className="text-link" onClick={() => setEdit(t)}>
                    Edit notes, date, estimate, links & subtasks
                  </button>
                </div>
              ))}
            <h3>Course & reading</h3>
            <Link href={`/courses?level=${active.courseLevel}`}>
              {selectedCourse(state, active.courseLevel).title} →
            </Link>
            {active.resources.map((r) => (
              <a
                className="list-item"
                target="_blank"
                rel="noreferrer"
                key={r.url}
                href={r.url}
              >
                {r.title} ↗
              </a>
            ))}
            <button
              onClick={() =>
                mutate(
                  (s) => ({
                    ...s,
                    preferences: {
                      ...s.preferences,
                      activeWeek: active.number,
                    },
                  }),
                  "Current week updated",
                )
              }
            >
              Set as current learning week
            </button>
          </>
        )}
      </Modal>
      <TaskEditor task={edit} onClose={() => setEdit(null)} />
    </>
  );
}
export function TaskEditor({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const { mutate } = useStore();
  return (
    <Modal title="Edit learning task" open={!!task} onClose={onClose}>
      {task && (
        <form
          key={task.id}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mutate(
              (s) => ({
                ...s,
                tasks: s.tasks.map((t) =>
                  t.id === task.id
                    ? {
                        ...t,
                        title: str(f, "title"),
                        notes: str(f, "notes"),
                        estimate: num(f, "estimate"),
                        scheduled: str(f, "scheduled"),
                        priority: str(f, "priority") as Task["priority"],
                        assistance: str(f, "assistance") as Task["assistance"],
                        links: str(f, "links").split("\n").filter(Boolean),
                        subtasks: [
                          ...t.subtasks,
                          ...str(f, "subtask")
                            .split("\n")
                            .filter(Boolean)
                            .map((title) => ({
                              id: uuid(),
                              title,
                              done: false,
                            })),
                        ],
                      }
                    : t,
                ),
              }),
              "Task updated",
            );
            onClose();
          }}
        >
          <Field label="Title">
            <input name="title" defaultValue={task.title} required />
          </Field>
          <div className="two-cols">
            <Field label="Scheduled date">
              <input
                type="date"
                name="scheduled"
                defaultValue={task.scheduled}
                required
              />
            </Field>
            <Field label="Estimate (minutes)">
              <input
                type="number"
                name="estimate"
                min="0"
                max="1440"
                defaultValue={task.estimate}
              />
            </Field>
          </div>
          <Field label="Priority">
            <select name="priority" defaultValue={task.priority}>
              {["low", "normal", "high"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="AI assistance">
            <select name="assistance" defaultValue={task.assistance}>
              <option value="none">Without AI</option>
              <option value="hints">With hints</option>
              <option value="substantial">Substantial assistance</option>
            </select>
          </Field>
          <Field label="Notes / assessment answers">
            <textarea name="notes" rows={5} defaultValue={task.notes} />
          </Field>
          <Field label="Attached URLs (one per line)">
            <textarea name="links" defaultValue={task.links.join("\n")} />
          </Field>
          {task.subtasks.map((t) => (
            <label className="checkbox-label" key={t.id}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={(e) => {
                  const eventChecked = e.target.checked;
                  mutate(
                    (s) => ({
                      ...s,
                      tasks: s.tasks.map((x) =>
                        x.id === task.id
                          ? {
                              ...x,
                              subtasks: x.subtasks.map((st) =>
                                st.id === t.id
                                  ? { ...st, done: eventChecked }
                                  : st,
                              ),
                            }
                          : x,
                      ),
                    }),
                    "Subtask updated",
                  );
                }}
              />
              {t.title}
            </label>
          ))}
          <Field label="Add subtasks (one per line)">
            <textarea name="subtask" />
          </Field>
          <button className="primary">Save task</button>
        </form>
      )}
    </Modal>
  );
}
export function selectedCourse(
  state: ReturnType<typeof useStore>["state"],
  level: number,
) {
  const c = courses.find((c) => c.level === level)!;
  return state.courses[level]?.choice === "alternative"
    ? { title: c.alternative, url: c.alternativeUrl }
    : { title: c.name, url: c.url };
}
export function Courses({ level }: { level: number }) {
  const { state, mutate } = useStore(),
    [q, setQ] = useState(""),
    [phase, setPhase] = useState("all"),
    [view, setView] = useState("Grid"),
    [detail, setDetail] = useState(level || 0);
  return (
    <>
      <Header
        title="Course library"
        subtitle="Ten levels. Two paths per level. Choose one, then learn by building."
      />
      <div className="info">
        Pathway topic trackers are editable learning aids, not official lesson
        titles. Provider progress is tracked manually.
      </div>
      <div className="toolbar">
        <input
          aria-label="Search courses"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search course or provider"
        />
        <select
          aria-label="Course phase"
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
        >
          <option value="all">All phases</option>
          {phases.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setView((v) => (v === "Grid" ? "List" : "Grid"))}
        >
          {view === "Grid" ? "List view" : "Grid view"}
        </button>
      </div>
      <div className={view === "Grid" ? "course-grid" : "course-list"}>
        {courses
          .filter(
            (c) =>
              (phase === "all" || phase === c.phase) &&
              `${c.name} ${c.alternative} ${c.provider}`
                .toLowerCase()
                .includes(q.toLowerCase()),
          )
          .map((c) => (
            <article className="panel course-card" key={c.level}>
              <span className="eyebrow">
                LEVEL {c.level} · {c.duration}
              </span>
              <h2>{selectedCourse(state, c.level).title}</h2>
              <p className="muted">
                {state.courses[c.level].choice === "alternative"
                  ? c.author
                  : c.provider}
              </p>
              <p>{c.note}</p>
              <Progress value={courseProgress(state, c.level)} />
              <small>
                {Math.round(courseProgress(state, c.level))}% tracked lessons ·{" "}
                {state.courses[c.level].enrolled ? "Enrolled" : "Not enrolled"}
              </small>
              <div className="actions">
                <button className="primary" onClick={() => setDetail(c.level)}>
                  View course
                </button>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={selectedCourse(state, c.level).url}
                >
                  Open provider ↗
                </a>
              </div>
            </article>
          ))}
      </div>
      <Modal
        title={detail ? `Level ${detail}: Course details` : "Course details"}
        open={!!detail}
        onClose={() => setDetail(0)}
      >
        {detail > 0 &&
          courses
            .filter((c) => c.level === detail)
            .map((c) => (
              <div key={c.level}>
                <h3>Choose your learning path</h3>
                {(["primary", "alternative"] as const).map((choice) => (
                  <div className="choice-card" key={choice}>
                    <label>
                      <input
                        type="radio"
                        name="choice"
                        checked={state.courses[detail].choice === choice}
                        onChange={() =>
                          mutate(
                            (s) => ({
                              ...s,
                              courses: {
                                ...s.courses,
                                [detail]: { ...s.courses[detail], choice },
                              },
                            }),
                            "Course preference saved",
                          )
                        }
                      />{" "}
                      {choice === "primary" ? c.name : c.alternative}
                    </label>
                    <small>
                      {choice === "primary"
                        ? "Primary recommendation · " + c.provider
                        : "Alternative · " + c.author}
                    </small>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={choice === "primary" ? c.url : c.alternativeUrl}
                    >
                      Open course ↗
                    </a>
                  </div>
                ))}
                <button
                  className="primary"
                  onClick={() =>
                    mutate(
                      (s) => ({
                        ...s,
                        courses: {
                          ...s.courses,
                          [detail]: {
                            ...s.courses[detail],
                            enrolled: !s.courses[detail].enrolled,
                            enrollment: isoDay(),
                          },
                        },
                      }),
                      "Enrollment updated",
                    )
                  }
                >
                  {state.courses[detail].enrolled
                    ? "Pause enrollment"
                    : "Start course"}
                </button>
                <h3>Your topic tracker</h3>
                {[
                  ...new Set(
                    state.lessons
                      .filter((l) => l.level === detail)
                      .map((l) => l.section),
                  ),
                ].map((section) => (
                  <div key={section}>
                    <h4>{section}</h4>
                    {state.lessons
                      .filter(
                        (l) => l.level === detail && l.section === section,
                      )
                      .map((l) => (
                        <Link
                          className="list-item"
                          href={`/courses?lesson=${l.id}`}
                          key={l.id}
                        >
                          <span>
                            {l.done ? "✓ " : "○ "}
                            {l.title}
                          </span>
                          <small>Week {l.week} →</small>
                        </Link>
                      ))}
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    mutate(
                      (s) => ({
                        ...s,
                        lessons: [
                          ...s.lessons,
                          {
                            id: uuid(),
                            level: detail,
                            week: num(f, "week"),
                            section: str(f, "section"),
                            title: str(f, "title"),
                            done: false,
                          },
                        ],
                      }),
                      "Lesson added",
                    );
                    e.currentTarget.reset();
                  }}
                >
                  <h3>Add your own lesson</h3>
                  <Field label="Section">
                    <input name="section" required />
                  </Field>
                  <Field label="Lesson title">
                    <input name="title" required />
                  </Field>
                  <Field label="Related week">
                    <select name="week">
                      {weeks
                        .filter((w) => w.courseLevel === detail)
                        .map((w) => (
                          <option value={w.number} key={w.number}>
                            Week {w.number}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <button>
                    <Plus size={14} /> Add lesson
                  </button>
                </form>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    mutate(
                      (s) => ({
                        ...s,
                        courses: {
                          ...s.courses,
                          [detail]: {
                            ...s.courses[detail],
                            notes: str(f, "notes"),
                            rating: num(f, "rating"),
                            target: str(f, "target"),
                          },
                        },
                      }),
                      "Course notes saved",
                    );
                  }}
                >
                  <Field label="Course notes">
                    <textarea
                      name="notes"
                      defaultValue={state.courses[detail].notes}
                    />
                  </Field>
                  <Field label="Personal rating (0–5)">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      name="rating"
                      defaultValue={state.courses[detail].rating}
                    />
                  </Field>
                  <Field label="Target date">
                    <input
                      type="date"
                      name="target"
                      defaultValue={state.courses[detail].target}
                    />
                  </Field>
                  <button>Save course notes</button>
                </form>
              </div>
            ))}
      </Modal>
    </>
  );
}
export function LessonDetail({ id }: { id: string }) {
  const { state, mutate } = useStore(),
    lesson = state.lessons.find((l) => l.id === id);
  if (!lesson)
    return (
      <Empty>
        Lesson not found. <Link href="/courses">Browse courses</Link>
      </Empty>
    );
  const w = weeks[lesson.week - 1];
  return (
    <>
      <Header
        title={lesson.title}
        subtitle={`Pathway learning topic · Week ${lesson.week} · ${lesson.section}`}
      />
      <section className="panel">
        <div className="actions">
          <Link href={`/courses?level=${lesson.level}`}>← Course details</Link>
          <a
            target="_blank"
            rel="noreferrer"
            href={selectedCourse(state, lesson.level).url}
          >
            Open {selectedCourse(state, lesson.level).title} ↗
          </a>
        </div>
        <h2>Understand, practice, explain</h2>
        <ul>
          {w.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <p>{w.exercise}</p>
        <button
          className="primary"
          onClick={() =>
            mutate(
              (s) => completeLesson(s, id, !lesson.done),
              lesson.done ? "Lesson reset" : "Lesson completed",
              `/courses?lesson=${id}`,
            )
          }
        >
          {lesson.done ? "Reset lesson completion" : "Mark lesson complete"}
        </button>
        <p className="muted">
          Completing a topic updates course and roadmap learning progress.
          Practical work and evidence remain separate.
        </p>
        <h3>Related work</h3>
        {state.tasks
          .filter((t) => t.week === lesson.week && t.type !== "lesson")
          .map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        <Link className="button" href={`/projects?id=week-${lesson.week}`}>
          Open weekly project
        </Link>
        <div className="actions">
          <Link href="/planner">
            <Clock3 size={16} /> Log study time
          </Link>
        </div>
      </section>
    </>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "../components/provider";
import {
  Header,
  Progress,
  Field,
  Modal,
  Empty,
  Stat,
  num,
  str,
  uuid,
  stamp,
} from "../components/ui";
import { weeks, skills, isoDay, addDays, phases, courses } from "../data/seed";
import {
  weekProgress,
  phaseProgress,
  weeklyHours,
  streak,
  monday,
  courseProgress,
} from "../lib/calculations";
import { StudyChart } from "./learning";
import type { Project } from "../lib/schema";
export function Projects({ selected }: { selected: string }) {
  const { state, mutate } = useStore(),
    [filter, setFilter] = useState("portfolio"),
    [q, setQ] = useState(""),
    [id, setId] = useState(selected),
    [tab, setTab] = useState("Overview"),
    [adding, setAdding] = useState(false);
  const p = state.projects.find((p) => p.id === id);
  function update(patch: Partial<Project>, label = "Project updated") {
    mutate(
      (s) => ({
        ...s,
        projects: s.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }),
      label,
      `/projects?id=${id}`,
    );
  }
  function complete() {
    if (!p) return;
    mutate(
      (s) => {
        const project = s.projects.find((x) => x.id === id)!;
        if (
          !project.checks.every(Boolean) ||
          !project.repo ||
          !project.retrospective.trim()
        )
          throw Error(
            "Complete every criterion, add a repository URL and write a retrospective first.",
          );
        return {
          ...s,
          projects: s.projects.map((x) =>
            x.id === id ? { ...x, status: "completed" } : x,
          ),
          tasks: s.tasks.map((t) =>
            t.week === project.week &&
            t.type === "deliverable" &&
            project.id === `week-${project.week}`
              ? { ...t, status: "completed", completedAt: stamp() }
              : t,
          ),
        };
      },
      "Project completed",
      `/projects?id=${id}`,
    );
  }
  return (
    <>
      <Header
        title="Project studio"
        subtitle="Build working systems and preserve the evidence behind your engineering growth."
        actions={
          <button className="primary" onClick={() => setAdding(true)}>
            + New project
          </button>
        }
      />
      <div className="toolbar">
        <input
          aria-label="Search projects"
          placeholder="Search projects"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="Project type"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["all", "portfolio", "capstone", "weekly", "open-source"].map(
            (t) => (
              <option key={t}>{t}</option>
            ),
          )}
        </select>
      </div>
      <div className="course-grid">
        {state.projects
          .filter(
            (p) =>
              (filter === "all" || p.type === filter) &&
              p.title.toLowerCase().includes(q.toLowerCase()),
          )
          .map((p) => (
            <button
              className="panel project-card"
              key={p.id}
              onClick={() => {
                setId(p.id);
                setTab("Overview");
              }}
            >
              <span className="eyebrow">
                {p.type} · week {p.week}
              </span>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="tags">
                {p.skills.slice(0, 5).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <Progress
                value={
                  (p.checks.filter(Boolean).length / p.checks.length) * 100
                }
              />
              <small>
                {p.status.replace("_", " ")} · {p.checks.filter(Boolean).length}
                /{p.checks.length} criteria
              </small>
            </button>
          ))}
      </div>
      <Modal
        title={p?.title ?? "Project detail"}
        open={!!p}
        onClose={() => setId("")}
      >
        {p && (
          <>
            <div className="tabs">
              {[
                "Overview",
                "Tasks",
                "Architecture",
                "Testing",
                "Retrospective",
              ].map((t) => (
                <button
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                  key={t}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "Overview" && (
              <>
                <p>{p.description}</p>
                <p>
                  <b>Deliverable:</b> {p.title}
                </p>
                <p>
                  <b>Learning goals:</b>{" "}
                  {weeks[p.week - 1].objectives.join(" ")}
                </p>
                <p>
                  <b>Tech stack:</b> {p.stack}
                </p>
                <p>
                  <b>Target:</b> {p.target} ·{" "}
                  {p.type === "portfolio"
                    ? "Advanced integrated portfolio work"
                    : "Foundational practical assignment"}
                </p>
                <Progress
                  value={
                    (p.checks.filter(Boolean).length / p.checks.length) * 100
                  }
                />
                <Field label="Project status">
                  <select
                    value={p.status}
                    onChange={(e) => {
                      const eventValue = e.target.value;
                      if (eventValue === "completed") complete();
                      else
                        mutate(
                          (s) => ({
                            ...s,
                            projects: s.projects.map((x) =>
                              x.id === id
                                ? {
                                    ...x,
                                    status: eventValue as Project["status"],
                                  }
                                : x,
                            ),
                            tasks: s.tasks.map((t) =>
                              p.id === `week-${p.week}` &&
                              t.week === p.week &&
                              t.type === "deliverable"
                                ? {
                                    ...t,
                                    status: "not_started",
                                    completedAt: null,
                                  }
                                : t,
                            ),
                          }),
                          "Project status updated",
                        );
                    }}
                  >
                    {[
                      "planned",
                      "in_progress",
                      "blocked",
                      "in_review",
                      "completed",
                      "archived",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <form
                  key={id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    update({
                      repo: str(f, "repo"),
                      demo: str(f, "demo"),
                      target: str(f, "target"),
                      stack: str(f, "stack"),
                      screenshots: str(f, "screenshots")
                        .split("\n")
                        .filter(Boolean),
                    });
                  }}
                >
                  <Field label="GitHub repository URL">
                    <input type="url" name="repo" defaultValue={p.repo} />
                  </Field>
                  <Field label="Live demo URL">
                    <input type="url" name="demo" defaultValue={p.demo} />
                  </Field>
                  <Field label="Target completion">
                    <input
                      type="date"
                      name="target"
                      defaultValue={p.target}
                      required
                    />
                  </Field>
                  <Field label="Technology stack">
                    <input name="stack" defaultValue={p.stack} />
                  </Field>
                  <Field label="Screenshot URLs (one per line)">
                    <textarea
                      name="screenshots"
                      defaultValue={p.screenshots.join("\n")}
                    />
                  </Field>
                  <button>Save project metadata</button>
                </form>
                {p.repo && (
                  <a href={p.repo} rel="noreferrer" target="_blank">
                    Open repository ↗
                  </a>
                )}
              </>
            )}
            {tab === "Tasks" && (
              <>
                <h3>Acceptance criteria</h3>
                {p.criteria.map((c, i) => (
                  <label className="checkbox-label" key={c}>
                    <input
                      type="checkbox"
                      checked={p.checks[i]}
                      onChange={(e) => {
                        const eventChecked = e.target.checked;
                        mutate(
                          (s) => ({
                            ...s,
                            projects: s.projects.map((x) =>
                              x.id === id
                                ? {
                                    ...x,
                                    checks: x.checks.map((v, j) =>
                                      j === i ? eventChecked : v,
                                    ),
                                    status:
                                      x.status === "completed"
                                        ? "in_review"
                                        : x.status,
                                  }
                                : x,
                            ),
                            tasks: s.tasks.map((t) =>
                              p.id === `week-${p.week}` &&
                              t.week === p.week &&
                              t.type === "deliverable" &&
                              p.status === "completed"
                                ? {
                                    ...t,
                                    status: "not_started",
                                    completedAt: null,
                                  }
                                : t,
                            ),
                          }),
                          "Project criterion updated",
                        );
                      }}
                    />
                    {c}
                  </label>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    update({
                      criteria: [...p.criteria, str(f, "criterion")],
                      checks: [...p.checks, false],
                      status: p.status === "completed" ? "in_review" : p.status,
                    });
                    e.currentTarget.reset();
                  }}
                >
                  <Field label="Add task or subtask">
                    <input name="criterion" required maxLength={500} />
                  </Field>
                  <button>Add criterion</button>
                </form>
                <Link href={`/roadmap?week=${p.week}`}>
                  Related weekly work →
                </Link>
              </>
            )}
            {["Architecture", "Testing", "Retrospective"].includes(tab) && (
              <form
                key={`${id}-${tab}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  update({ [tab.toLowerCase()]: str(f, "body") });
                }}
              >
                <h3>
                  {tab === "Architecture"
                    ? "System components · database design · API contracts"
                    : tab === "Testing"
                      ? "Test checklist · known issues · outcomes"
                      : "What worked · challenges · lessons · improvements"}
                </h3>
                <Field label={`${tab} notes`}>
                  <textarea
                    name="body"
                    rows={12}
                    defaultValue={
                      tab === "Architecture"
                        ? p.architecture
                        : tab === "Testing"
                          ? p.testing
                          : p.retrospective
                    }
                  />
                </Field>
                <button className="primary">Save {tab.toLowerCase()}</button>
              </form>
            )}
            <div className="actions">
              <button className="primary" onClick={complete}>
                Mark project complete
              </button>
              {p.status === "completed" && (
                <button
                  onClick={() =>
                    mutate(
                      (s) => {
                        const additions = p.skills
                          .filter(
                            (skill) =>
                              !s.evidence.some(
                                (e) =>
                                  e.projectId === p.id && e.skill === skill,
                              ),
                          )
                          .map((skill) => ({
                            id: uuid(),
                            skill,
                            title: p.title,
                            url: p.repo,
                            projectId: p.id,
                            kind: "project" as const,
                            createdAt: stamp(),
                          }));
                        return {
                          ...s,
                          evidence: [...s.evidence, ...additions],
                        };
                      },
                      "Project linked as skill evidence",
                      "/skills",
                    )
                  }
                >
                  Link completed project as skill evidence
                </button>
              )}
            </div>
            <small>
              Completion requires all criteria, repository URL and
              retrospective. Proficiency remains self-assessed.
            </small>
          </>
        )}
      </Modal>
      <Modal
        title="New engineering project"
        open={adding}
        onClose={() => setAdding(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const criteria = str(f, "criteria").split("\n").filter(Boolean);
            mutate(
              (s) => ({
                ...s,
                projects: [
                  ...s.projects,
                  {
                    id: uuid(),
                    title: str(f, "title"),
                    description: str(f, "description"),
                    week: num(f, "week"),
                    type: "open-source",
                    skills: str(f, "skills")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    criteria,
                    checks: criteria.map(() => false),
                    status: "planned",
                    repo: "",
                    demo: "",
                    architecture: "",
                    testing: "",
                    retrospective: "",
                    start: isoDay(),
                    target: str(f, "target"),
                    stack: str(f, "stack"),
                    screenshots: [],
                  },
                ],
              }),
              "Project created",
            );
            setAdding(false);
          }}
        >
          <Field label="Title">
            <input name="title" required />
          </Field>
          <Field label="Brief">
            <textarea name="description" />
          </Field>
          <Field label="Related week">
            <input
              type="number"
              name="week"
              min="1"
              max="52"
              defaultValue={state.preferences.activeWeek}
            />
          </Field>
          <Field label="Skills (comma separated)">
            <input name="skills" defaultValue="Python, Testing" />
          </Field>
          <Field label="Tech stack">
            <input name="stack" />
          </Field>
          <Field label="Acceptance criteria (one per line)">
            <textarea name="criteria" required />
          </Field>
          <Field label="Target">
            <input
              type="date"
              name="target"
              defaultValue={addDays(isoDay(), 7)}
              required
            />
          </Field>
          <button className="primary">Create project</button>
        </form>
      </Modal>
    </>
  );
}
export function Skills() {
  const { state, mutate } = useStore(),
    [q, setQ] = useState(""),
    [category, setCategory] = useState("all"),
    [evidence, setEvidence] = useState("");
  const labels = [
    "Not started",
    "Awareness",
    "Basic understanding",
    "Can apply independently",
    "Proficient",
    "Advanced",
  ];
  return (
    <>
      <Header
        title="Skills & evidence"
        subtitle="Self-reported confidence and demonstrated practical capability, tracked separately."
      />
      <div className="toolbar">
        <input
          aria-label="Search skills"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills"
        />
        <select
          aria-label="Skill category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {[...new Set(skills.map((s) => s.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="course-grid">
        {[...new Set(skills.map((s) => s.category))]
          .filter((c) => category === "all" || category === c)
          .map((c) => (
            <section className="panel" key={c}>
              <h2>{c}</h2>
              <p className="muted">
                {
                  skills.filter(
                    (s) =>
                      s.category === c &&
                      state.evidence.some((e) => e.skill === s.name),
                  ).length
                }{" "}
                skills with evidence
              </p>
              {skills
                .filter(
                  (s) =>
                    s.category === c &&
                    s.name.toLowerCase().includes(q.toLowerCase()),
                )
                .map((skill) => (
                  <div className="skill-row" key={skill.name}>
                    <label>
                      {skill.name}
                      <select
                        aria-label={`${skill.name} proficiency`}
                        value={state.skills[skill.name] ?? 0}
                        onChange={(e) => {
                          const eventValue = e.target.value;
                          const level = Number(eventValue);
                          mutate(
                            (s) => ({
                              ...s,
                              skills: { ...s.skills, [skill.name]: level },
                              skillHistory: [
                                ...s.skillHistory,
                                { skill: skill.name, level, at: stamp() },
                              ],
                            }),
                            "Skill assessment saved",
                            "/skills",
                          );
                        }}
                      >
                        {labels.map((l, i) => (
                          <option key={l} value={i}>
                            {i} · {l}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button onClick={() => setEvidence(skill.name)}>
                      {
                        state.evidence.filter((e) => e.skill === skill.name)
                          .length
                      }{" "}
                      evidence · Add / view
                    </button>
                  </div>
                ))}
            </section>
          ))}
      </div>
      <section className="panel">
        <h2>Assessment history</h2>
        {state.skillHistory.length ? (
          state.skillHistory
            .slice(-10)
            .reverse()
            .map((h, i) => (
              <p key={i}>
                {h.skill}: {labels[h.level]} · {h.at.slice(0, 10)}
              </p>
            ))
        ) : (
          <Empty>Your self-assessment history will appear here.</Empty>
        )}
      </section>
      <Modal
        title={`Evidence: ${evidence}`}
        open={!!evidence}
        onClose={() => setEvidence("")}
      >
        {state.evidence
          .filter((e) => e.skill === evidence)
          .map((e) => (
            <div className="list-item" key={e.id}>
              <div>
                <b>{e.title}</b>
                <small>{e.kind}</small>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noreferrer">
                    View evidence ↗
                  </a>
                )}
              </div>
              <button
                onClick={() =>
                  mutate(
                    (s) => ({
                      ...s,
                      evidence: s.evidence.filter((x) => x.id !== e.id),
                    }),
                    "Evidence removed",
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mutate(
              (s) => ({
                ...s,
                evidence: [
                  ...s.evidence,
                  {
                    id: uuid(),
                    skill: evidence,
                    title: str(f, "title"),
                    url: str(f, "url"),
                    projectId: str(f, "project"),
                    kind: str(f, "kind") as "project",
                    createdAt: stamp(),
                  },
                ],
              }),
              "Skill evidence added",
              "/skills",
            );
            e.currentTarget.reset();
          }}
        >
          <Field label="Evidence title">
            <input name="title" required />
          </Field>
          <Field label="Type">
            <select name="kind">
              {[
                "project",
                "exercise",
                "assessment",
                "repository",
                "explanation",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Link">
            <input type="url" name="url" />
          </Field>
          <Field label="Completed project">
            <select name="project">
              <option value="">No linked project</option>
              {state.projects
                .filter((p) => p.status === "completed")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
            </select>
          </Field>
          <button className="primary">Add evidence</button>
        </form>
      </Modal>
    </>
  );
}
export function Analytics() {
  const { state } = useStore(),
    total = state.sessions.reduce((s, x) => s + x.duration, 0),
    month = isoDay().slice(0, 7),
    practices = state.tasks.filter(
      (t) => t.type === "practice" && t.status === "completed",
    ),
    independent = practices.filter((t) => t.assistance === "none").length;
  const subject = Object.entries(
    state.sessions.reduce<Record<string, number>>(
      (map, s) => ({ ...map, [s.subject]: (map[s.subject] ?? 0) + s.duration }),
      {},
    ),
  );
  return (
    <>
      <Header
        title="Learning analytics"
        subtitle="A clear picture of recorded effort, completed work and growing independence."
      />
      <div className="stats">
        <Stat
          label="Total study"
          value={`${(total / 60).toFixed(1)}h`}
          detail={`${state.sessions.length} confirmed sessions`}
        />
        <Stat
          label="This week"
          value={`${weeklyHours(state).toFixed(1)}h`}
          detail={`${Math.round((weeklyHours(state) / state.preferences.target) * 100)}% of weekly goal`}
        />
        <Stat
          label="This month"
          value={`${(state.sessions.filter((s) => s.date.startsWith(month)).reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1)}h`}
        />
        <Stat
          label="Independent practice"
          value={`${practices.length ? Math.round((independent / practices.length) * 100) : 0}%`}
          detail={`${independent} of ${practices.length} completed exercises`}
        />
      </div>
      <div className="stats">
        <Stat
          label="Average session"
          value={`${state.sessions.length ? Math.round(total / state.sessions.length) : 0}m`}
        />
        <Stat label="Learning streak" value={`${streak(state)} days`} />
        <Stat
          label="Lessons completed"
          value={String(state.lessons.filter((l) => l.done).length)}
        />
        <Stat
          label="Demonstrated skills"
          value={String(
            new Set(
              state.evidence
                .filter(
                  (e) =>
                    e.kind !== "project" ||
                    state.projects.find((p) => p.id === e.projectId)?.status ===
                      "completed",
                )
                .map((e) => e.skill),
            ).size,
          )}
        />
      </div>
      <div className="two-cols">
        <section className="panel">
          <h2>Planned and recorded hours</h2>
          <StudyChart />
        </section>
        <section className="panel">
          <h2>Study hours by subject</h2>
          {subject.length ? (
            subject.map(([name, minutes]) => (
              <div className="metric-row" key={name}>
                <span>{name}</span>
                <b>{(minutes / 60).toFixed(1)}h</b>
                <Progress value={(minutes / total) * 100} />
              </div>
            ))
          ) : (
            <Empty>Log a study session to see a subject breakdown.</Empty>
          )}
        </section>
      </div>
      <div className="two-cols">
        <section className="panel">
          <h2>Last eight weeks</h2>
          {Array.from({ length: 8 }, (_, i) =>
            addDays(monday(), (i - 7) * 7),
          ).map((day) => (
            <div className="metric-row" key={day}>
              <span>Week of {day}</span>
              <b>{weeklyHours(state, day).toFixed(1)}h</b>
              <Progress
                value={Math.min(
                  100,
                  (weeklyHours(state, day) / state.preferences.target) * 100,
                )}
              />
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Learning activity · last 84 days</h2>
          <div className="heatmap">
            {Array.from({ length: 84 }, (_, i) =>
              addDays(isoDay(), i - 83),
            ).map((day) => {
              const minutes = state.sessions
                .filter((s) => s.date === day)
                .reduce((s, x) => s + x.duration, 0);
              return (
                <span
                  className={minutes ? "active" : ""}
                  key={day}
                  title={`${day}: ${minutes} study minutes`}
                  aria-label={`${day}: ${minutes} minutes`}
                  style={{
                    opacity: minutes ? Math.min(1, 0.3 + minutes / 300) : 1,
                  }}
                />
              );
            })}
          </div>
          <p className="muted">Only confirmed study activity is counted.</p>
          <h3>Task completion · last four weeks</h3>
          {Array.from({ length: 4 }, (_, i) =>
            addDays(monday(), (i - 3) * 7),
          ).map((day) => (
            <p key={day}>
              {day}:{" "}
              {
                state.tasks.filter(
                  (t) =>
                    t.completedAt &&
                    t.completedAt.slice(0, 10) >= day &&
                    t.completedAt.slice(0, 10) < addDays(day, 7),
                ).length
              }{" "}
              tasks completed
            </p>
          ))}
        </section>
      </div>
      <div className="two-cols">
        <section className="panel">
          <h2>Roadmap progress</h2>
          {phases.map((p) => (
            <div className="metric-row" key={p.id}>
              <span>{p.name}</span>
              <b>{Math.round(phaseProgress(state, p.id))}%</b>
              <Progress value={phaseProgress(state, p.id)} />
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Course progress</h2>
          {courses.map((c) => (
            <div className="metric-row" key={c.level}>
              <span>{c.name}</span>
              <b>{Math.round(courseProgress(state, c.level))}%</b>
              <Progress value={courseProgress(state, c.level)} />
            </div>
          ))}
        </section>
      </div>
      <section className="panel">
        <h2>Portfolio completion</h2>
        {state.projects
          .filter((p) => p.type === "portfolio")
          .map((p) => (
            <div className="metric-row" key={p.id}>
              <span>{p.title}</span>
              <b>{p.status}</b>
              <Progress
                value={
                  (p.checks.filter(Boolean).length / p.checks.length) * 100
                }
              />
            </div>
          ))}
        <p>
          You recorded {weeklyHours(state).toFixed(1)} of your planned{" "}
          {state.preferences.target} hours this week.{" "}
          {state.tasks.filter((t) => t.status === "completed").length} tasks
          completed;{" "}
          {weeks.filter((w) => weekProgress(state, w.number) === 100).length}{" "}
          weeks fully complete.
        </p>
        <p className="muted">
          Assistance breakdown:{" "}
          {practices.filter((t) => t.assistance === "none").length} unassisted ·{" "}
          {practices.filter((t) => t.assistance === "hints").length} with hints
          · {practices.filter((t) => t.assistance === "substantial").length}{" "}
          with substantial assistance.
        </p>
      </section>
    </>
  );
}

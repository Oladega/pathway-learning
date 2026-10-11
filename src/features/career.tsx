"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useStore } from "../components/provider";
import {
  Header,
  Stat,
  Progress,
  Field,
  Modal,
  Empty,
  str,
  num,
  uuid,
  stamp,
} from "../components/ui";
import {
  roleSkills,
  portfolioChecklist,
  isoDay,
  weeks,
  skills,
} from "../data/seed";
import { readiness } from "../lib/calculations";
import { mode } from "../lib/database/client";
import type { Job } from "../lib/schema";
export function Career() {
  const { state, mutate } = useStore(),
    [role, setRole] = useState(state.preferences.career),
    [tab, setTab] = useState("Readiness"),
    [board, setBoard] = useState(true),
    [job, setJob] = useState<Job | null>(null);
  const ready = readiness(state, role),
    statuses = [
      "Interested",
      "Applied",
      "Screening",
      "Interviewing",
      "Offer",
      "Rejected",
      "Withdrawn",
    ] as const;
  return (
    <>
      <Header
        title="Career hub"
        subtitle="Connect practical evidence to role requirements, interviews and applications."
      />
      <div className="tabs">
        {["Readiness", "Interview practice", "Applications", "Portfolio"].map(
          (t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ),
        )}
      </div>
      {tab === "Readiness" && (
        <>
          <div className="career-banner">
            <div>
              <span className="eyebrow">YOUR NEXT CHAPTER</span>
              <h2>{role}</h2>
              <p>
                Readiness is an evidence coverage estimate, not a hiring
                probability.
              </p>
              <select
                aria-label="Target role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {Object.keys(roleSkills).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <Stat
              label="Requirements with evidence"
              value={`${ready.score}%`}
              detail={`${ready.demonstrated.length} / ${ready.required.length} skills`}
            />
          </div>
          <section className="panel">
            <h2>Demonstrated strengths & missing evidence</h2>
            {ready.required.map((skill) => {
              const found = ready.demonstrated.includes(skill),
                matching = weeks.find((w) =>
                  w.topics
                    .join(" ")
                    .toLowerCase()
                    .includes(skill.toLowerCase()),
                );
              return (
                <div className="list-item" key={skill}>
                  <div>
                    <b>
                      {found ? "✓ " : "○ "}
                      {skill}
                    </b>
                    <small>
                      {found ? "Practical evidence linked" : "Missing evidence"}{" "}
                      · self-assessment {state.skills[skill] ?? 0}/5
                    </small>
                  </div>
                  <Link
                    href={
                      matching ? `/roadmap?week=${matching.number}` : "/skills"
                    }
                  >
                    {found ? "Review skill evidence" : "Find related learning"}{" "}
                    →
                  </Link>
                </div>
              );
            })}
            <Link className="primary" href="/skills">
              Add or review skill evidence
            </Link>
          </section>
        </>
      )}
      {tab === "Interview practice" && (
        <div className="course-grid">
          {state.interviews.map((i) => (
            <section className="panel" key={i.id}>
              <span className="eyebrow">{i.topic}</span>
              <h2>{i.question}</h2>
              <p>
                {i.attempts} attempts · confidence {i.confidence}/5
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  mutate(
                    (s) => ({
                      ...s,
                      interviews: s.interviews.map((x) =>
                        x.id === i.id
                          ? {
                              ...x,
                              attempts: x.attempts + 1,
                              confidence: num(f, "confidence"),
                              notes: str(f, "notes"),
                              nextReview: str(f, "nextReview"),
                              difficulty: str(f, "difficulty") as "easy",
                            }
                          : x,
                      ),
                    }),
                    "Interview practice recorded",
                    "/career",
                  );
                }}
              >
                <Field label="Difficulty">
                  <select name="difficulty" defaultValue={i.difficulty}>
                    {["easy", "medium", "hard"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Confidence">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    name="confidence"
                    defaultValue={i.confidence}
                  />
                </Field>
                <Field label="Attempt notes & feedback">
                  <textarea name="notes" defaultValue={i.notes} />
                </Field>
                <Field label="Next review">
                  <input
                    type="date"
                    name="nextReview"
                    defaultValue={i.nextReview}
                  />
                </Field>
                <button>Record practice attempt</button>
              </form>
            </section>
          ))}
        </div>
      )}
      {tab === "Applications" && (
        <>
          <div className="toolbar">
            <button
              className="primary"
              onClick={() =>
                setJob({
                  id: uuid(),
                  company: "",
                  role: "",
                  url: "",
                  location: "",
                  arrangement: "Remote",
                  date: isoDay(),
                  status: "Interested",
                  resume: "",
                  contact: "",
                  notes: "",
                  nextAction: "",
                  followUp: "",
                })
              }
            >
              + Track application
            </button>
            <button onClick={() => setBoard(!board)}>
              {board ? "Table view" : "Board view"}
            </button>
          </div>
          {!state.jobs.length && (
            <Empty>
              No applications yet. Add opportunities when you are ready.
            </Empty>
          )}
          {board ? (
            <div className="job-board">
              {statuses.map((status) => (
                <section className="panel" key={status}>
                  <h3>
                    {status}{" "}
                    <small>
                      {state.jobs.filter((j) => j.status === status).length}
                    </small>
                  </h3>
                  {state.jobs
                    .filter((j) => j.status === status)
                    .map((j) => (
                      <button
                        className="job-card"
                        key={j.id}
                        onClick={() => setJob(j)}
                      >
                        <b>{j.company}</b>
                        <span>{j.role}</span>
                        <small>{j.nextAction || "Add a next action"}</small>
                      </button>
                    ))}
                </section>
              ))}
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.jobs.map((j) => (
                    <tr key={j.id}>
                      <td>{j.company}</td>
                      <td>{j.role}</td>
                      <td>{j.status}</td>
                      <td>{j.followUp || "—"}</td>
                      <td>
                        <button onClick={() => setJob(j)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {tab === "Portfolio" && (
        <section className="panel">
          <h2>Portfolio readiness</h2>
          <Progress
            value={
              (portfolioChecklist.filter((item) => state.checklist[item])
                .length /
                portfolioChecklist.length) *
              100
            }
          />
          {portfolioChecklist.map((item) => (
            <label className="checkbox-label" key={item}>
              <input
                type="checkbox"
                checked={state.checklist[item] ?? false}
                onChange={(e) => {
                  const eventChecked = e.target.checked;
                  mutate(
                    (s) => ({
                      ...s,
                      checklist: { ...s.checklist, [item]: eventChecked },
                    }),
                    "Portfolio checklist updated",
                  );
                }}
              />
              {item}
            </label>
          ))}
        </section>
      )}
      <Modal title="Job application" open={!!job} onClose={() => setJob(null)}>
        {job && (
          <form
            key={job.id}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const data = {
                ...job,
                company: str(f, "company"),
                role: str(f, "role"),
                url: str(f, "url"),
                location: str(f, "location"),
                arrangement: str(f, "arrangement"),
                date: str(f, "date"),
                status: str(f, "status") as Job["status"],
                resume: str(f, "resume"),
                contact: str(f, "contact"),
                notes: str(f, "notes"),
                nextAction: str(f, "nextAction"),
                followUp: str(f, "followUp"),
              };
              mutate(
                (s) => ({
                  ...s,
                  jobs: s.jobs.some((x) => x.id === job.id)
                    ? s.jobs.map((x) => (x.id === job.id ? data : x))
                    : [...s.jobs, data],
                }),
                "Application saved",
              );
              setJob(null);
            }}
          >
            {[
              ["company", "Company"],
              ["role", "Role"],
              ["url", "Job URL"],
              ["location", "Location"],
              ["arrangement", "Work arrangement"],
              ["resume", "Resume version"],
              ["contact", "Contact person"],
              ["nextAction", "Next action"],
            ].map(([name, label]) => (
              <Field key={name} label={label}>
                <input
                  name={name}
                  type={name === "url" ? "url" : "text"}
                  required={["company", "role"].includes(name)}
                  defaultValue={String(job[name as keyof Job])}
                />
              </Field>
            ))}
            <Field label="Status">
              <select name="status" defaultValue={job.status}>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Application date">
              <input type="date" name="date" defaultValue={job.date} required />
            </Field>
            <Field label="Follow-up date">
              <input type="date" name="followUp" defaultValue={job.followUp} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" defaultValue={job.notes} />
            </Field>
            <div className="actions">
              <button className="primary">Save application</button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  if (window.confirm("Delete this application?")) {
                    mutate(
                      (s) => ({
                        ...s,
                        jobs: s.jobs.filter((j) => j.id !== job.id),
                      }),
                      "Application deleted",
                    );
                    setJob(null);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
export function Mentor() {
  const { state, mutate, session, busy } = useStore(),
    [configured, setConfigured] = useState(false),
    [loadingConfig, setLoadingConfig] = useState(true),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [draft, setDraft] = useState(""),
    [conversation, setConversation] = useState("default"),
    [help, setHelp] = useState("Hints only"),
    [purpose, setPurpose] = useState("Debugging Help");
  useEffect(() => {
    void fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfigured(d.mentor))
      .catch(() => setError("Could not check mentor configuration"))
      .finally(() => setLoadingConfig(false));
  }, []);
  const canUse = configured && mode === "cloud" && !!session;
  const history = state.messages.filter((m) => m.conversation === conversation);
  const suggestions = [
    "Explain a Python function using a small example.",
    "Help me debug this error with a first hint.",
    "Suggest practical tasks for my current week.",
    "Review the architecture of my project.",
  ];
  async function send() {
    if (!draft.trim() || pending || busy) return;
    setError("");
    setPending(true);
    const user = {
      id: uuid(),
      role: "user" as const,
      body: draft,
      createdAt: stamp(),
      conversation,
    };
    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          message: draft,
          mode: help,
          purpose,
          conversation,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error ?? "Mentor request failed");
      mutate(
        (s) => ({
          ...s,
          messages: [
            ...s.messages,
            user,
            {
              id: uuid(),
              role: "assistant",
              body: data.answer,
              createdAt: stamp(),
              conversation,
            },
          ],
        }),
        "Mentor conversation saved",
        "/mentor",
      );
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Header
        title="AI mentor"
        subtitle="Context-aware guidance that supports your ability to build independently."
      />
      <div className="info">
        {loadingConfig
          ? "Checking configuration…"
          : !configured
            ? "AI Mentor is disabled: configure a server-side LLM API key. Your drafts and notes remain usable."
            : mode === "local"
              ? "AI is configured, but mentor requires a signed-in cloud workspace so context can be authorized server-side."
              : "Mentor available · AI answers may contain errors. Validate against tests and documentation."}
      </div>
      <div className="toolbar">
        <select
          aria-label="Assistance mode"
          value={help}
          onChange={(e) => setHelp(e.target.value)}
        >
          {["Hints only", "Guided explanation", "Full explanation"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          aria-label="Mentor purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        >
          {[
            "Explain a Concept",
            "Debugging Help",
            "Study Plan",
            "Project Guidance",
            "Code Review",
            "Assessment",
            "Career Guidance",
          ].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          aria-label="Conversation"
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
        >
          {[
            ...new Set([
              "default",
              conversation,
              ...state.messages.map((m) => m.conversation),
            ]),
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() =>
            setConversation(
              `conversation-${new Date().toISOString().slice(0, 19)}`,
            )
          }
        >
          New conversation
        </button>
      </div>
      <div className="two-cols">
        <section className="panel mentor-panel">
          <h2>Your learning conversation</h2>
          {!history.length && (
            <Empty>
              Select a prompt or describe your question. No model response is
              fabricated when the service is unavailable.
            </Empty>
          )}
          {history.map((m) => (
            <article className={`message ${m.role}`} key={m.id}>
              <strong>{m.role === "user" ? "You" : "Mentor"}</strong>
              <div className="markdown">
                <ReactMarkdown>{m.body}</ReactMarkdown>
              </div>
              <div className="actions">
                <button
                  onClick={() => void navigator.clipboard.writeText(m.body)}
                >
                  Copy
                </button>
                <button
                  onClick={() =>
                    mutate(
                      (s) => ({
                        ...s,
                        notes: [
                          {
                            id: uuid(),
                            title: `Mentor ${purpose}`,
                            body: m.body,
                            tags: "mentor",
                            pinned: false,
                            type: "Debugging lesson",
                            week: s.preferences.activeWeek,
                            course: 0,
                            project: "",
                            updatedAt: stamp(),
                          },
                          ...s.notes,
                        ],
                      }),
                      "Mentor response saved as note",
                      "/notes",
                    )
                  }
                >
                  Save to note
                </button>
              </div>
            </article>
          ))}
          <div className="tags">
            {suggestions.map((s) => (
              <button key={s} onClick={() => setDraft(s)}>
                {s}
              </button>
            ))}
          </div>
          <Field label="Question, code or error">
            <textarea
              rows={7}
              value={draft}
              maxLength={12000}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste your code and error, and explain what you have tried."
            />
          </Field>
          <div className="actions">
            <button
              className="primary"
              disabled={!canUse || pending || busy || !draft.trim()}
              onClick={() => void send()}
            >
              {pending ? "Thinking…" : "Send to mentor"}
            </button>
            <button
              disabled={!draft.trim() || busy}
              onClick={() => {
                mutate(
                  (s) => ({
                    ...s,
                    notes: [
                      {
                        id: uuid(),
                        title: "Debugging draft",
                        body: draft,
                        tags: "mentor, debugging",
                        pinned: false,
                        type: "Debugging lesson",
                        week: s.preferences.activeWeek,
                        course: 0,
                        project: "",
                        updatedAt: stamp(),
                      },
                      ...s.notes,
                    ],
                  }),
                  "Draft saved as note",
                  "/notes",
                );
                setDraft("");
              }}
            >
              Save draft as note
            </button>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </section>
        <section className="panel">
          <h2>Local study guidance</h2>
          <p>
            Current focus: week {state.preferences.activeWeek},{" "}
            {weeks[state.preferences.activeWeek - 1].title}.
          </p>
          <ol>
            <li>
              Read the selected course topic and explain it in your own words.
            </li>
            <li>{weeks[state.preferences.activeWeek - 1].exercise}</li>
            <li>Test the acceptance criteria and document your reasoning.</li>
          </ol>
          <Link href={`/roadmap?week=${state.preferences.activeWeek}`}>
            Open this week →
          </Link>
          <h3>Skills to demonstrate</h3>
          <div className="tags">
            {skills.slice(0, 4).map((s) => (
              <Link key={s.name} href="/skills">
                {s.name}
              </Link>
            ))}
          </div>
          <Link href="/notes">Review saved debugging notes →</Link>
          <p className="muted">
            These are curriculum-based prompts, not generated AI answers.
          </p>
        </section>
      </div>
    </>
  );
}

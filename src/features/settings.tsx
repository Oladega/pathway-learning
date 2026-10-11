"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../components/provider";
import { Header, Field, Progress, Modal, str, num } from "../components/ui";
import {
  phases,
  weeks,
  courses,
  roleSkills,
  isoDay,
  addDays,
} from "../data/seed";
import { mode, supabase } from "../lib/database/client";
import type { State } from "../lib/schema";
export function Onboarding() {
  const { state, mutate, busy } = useStore(),
    [step, setStep] = useState(0),
    [p, setP] = useState(state.preferences),
    router = useRouter();
  const titles = [
    "Your journey into AI engineering starts here.",
    "Where are you starting?",
    "What are you working toward?",
    "Build a sustainable study rhythm.",
    "Choose how you learn.",
    "Your next chapter, mapped out.",
  ];
  return (
    <div className="onboarding-card">
      <span className="brand">✳ pathway.</span>
      <Progress value={((step + 1) / 6) * 100} />
      <span className="eyebrow">STEP {step + 1} OF 6</span>
      <h1>{titles[step]}</h1>
      {step === 0 && (
        <>
          <p>
            Turn your learning goals into a clear roadmap, build real projects,
            and track your progress toward an engineering career.
          </p>
          <Field label="Your name">
            <input
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
              required
            />
          </Field>
          <div className="info">
            {mode === "local"
              ? "Local mode: your progress stays in this browser. Export backups in Settings."
              : "Cloud mode: progress is saved to your authenticated account."}
          </div>
        </>
      )}
      {step === 1 && (
        <Field label="Programming experience">
          <select
            value={p.experience}
            onChange={(e) => setP({ ...p, experience: e.target.value })}
          >
            {[
              "I'm starting from scratch",
              "I understand basic programming but cannot build independently",
              "I can build simple applications",
              "I can independently build full-stack applications",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      )}
      {step === 2 && (
        <Field label="Career target">
          <select
            value={p.career}
            onChange={(e) => setP({ ...p, career: e.target.value })}
          >
            {[
              "AI Product Engineer",
              "Applied AI Engineer",
              "Machine Learning Engineer",
              "AI Infrastructure Engineer",
              "Research Engineer",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      )}
      {step === 3 && (
        <>
          <Field label="Weekly target (hours)">
            <input
              type="number"
              min="1"
              max="80"
              value={p.target}
              onChange={(e) => setP({ ...p, target: Number(e.target.value) })}
            />
          </Field>
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((d, i) => (
            <Field key={d} label={`${d} hours`}>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={p.schedule[i]}
                onChange={(e) =>
                  setP({
                    ...p,
                    schedule: p.schedule.map((v, j) =>
                      i === j ? Number(e.target.value) : v,
                    ),
                  })
                }
              />
            </Field>
          ))}
          <p>
            Total availability: {p.schedule.reduce((a, b) => a + b, 0)} hours
          </p>
        </>
      )}
      {step === 4 && (
        <Field label="Learning style">
          <select
            value={p.style}
            onChange={(e) => setP({ ...p, style: e.target.value })}
          >
            {[
              "University-style courses",
              "Guided video courses",
              "Project-based learning",
              "A combination",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      )}
      {step === 5 && (
        <>
          <p>
            {p.name} · {p.experience}
          </p>
          <p>
            {p.career} · {p.target} hours/week · flexible 52-week plan
          </p>
          <ol>
            {phases.map((phase) => (
              <li key={phase.id}>
                {phase.name} · {phase.range}
              </li>
            ))}
          </ol>
          <p>
            <b>First course:</b> {courses[0].name}
          </p>
          <p>
            <b>First deliverable:</b> {weeks[0].deliverable}
          </p>
          <Field label="Start date">
            <input
              type="date"
              value={p.start}
              onChange={(e) => setP({ ...p, start: e.target.value })}
            />
          </Field>
        </>
      )}
      <div className="actions">
        {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
        <button
          className="primary"
          disabled={
            busy ||
            !p.name.trim() ||
            p.target < 1 ||
            p.target > 80 ||
            p.schedule.some((h) => h < 0 || h > 24)
          }
          onClick={() => {
            if (step < 5) setStep(step + 1);
            else {
              mutate(
                (s) => ({
                  ...s,
                  onboarded: true,
                  preferences: p,
                  tasks: s.tasks.map((t) => ({
                    ...t,
                    scheduled: addDays(
                      p.start,
                      (t.week - 1) * 7 +
                        [
                          "lesson",
                          "practice",
                          "assessment",
                          "deliverable",
                        ].indexOf(t.type),
                    ),
                  })),
                  projects: s.projects.map((pr) => ({
                    ...pr,
                    start: p.start,
                    target: addDays(p.start, pr.week * 7 - 1),
                  })),
                }),
                "Learning plan created",
              );
              router.push("/dashboard");
            }
          }}
        >
          {step === 0
            ? "Build my learning plan"
            : step === 5
              ? "Start my journey"
              : "Continue"}
        </button>
      </div>
    </div>
  );
}
export function SettingsPage() {
  const { state, mutate, importData, reset, busy } = useStore(),
    [confirm, setConfirm] = useState(false),
    [fileError, setFileError] = useState("");
  const p = state.preferences;
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `pathway-${isoDay()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <Header
        title="Settings"
        subtitle="Shape your learning plan, appearance and data preferences."
      />
      <section className="panel">
        <h2>Profile & learning preferences</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mutate(
              (s) => ({
                ...s,
                preferences: {
                  ...s.preferences,
                  name: str(f, "name"),
                  email: str(f, "email"),
                  avatar: str(f, "avatar"),
                  background: str(f, "background"),
                  career: str(f, "career"),
                  target: num(f, "target"),
                  focus: num(f, "focus"),
                  break: num(f, "break"),
                  style: str(f, "style"),
                  providers: str(f, "providers"),
                  assistance: str(
                    f,
                    "assistance",
                  ) as State["preferences"]["assistance"],
                },
              }),
              "Preferences saved",
            );
          }}
        >
          <div className="two-cols">
            <Field label="Name">
              <input
                name="name"
                defaultValue={p.name}
                required
                maxLength={100}
              />
            </Field>
            <Field label="Email">
              <input type="email" name="email" defaultValue={p.email} />
            </Field>
            <Field label="Avatar URL">
              <input type="url" name="avatar" defaultValue={p.avatar} />
            </Field>
            <Field label="Career target">
              <select name="career" defaultValue={p.career}>
                {[...new Set([...Object.keys(roleSkills), p.career])].map(
                  (r) => (
                    <option key={r}>{r}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Weekly study target (hours)">
              <input
                type="number"
                min="1"
                max="80"
                name="target"
                defaultValue={p.target}
              />
            </Field>
            <Field label="Focus duration (minutes)">
              <input
                type="number"
                min="1"
                max="180"
                name="focus"
                defaultValue={p.focus}
              />
            </Field>
            <Field label="Break duration (minutes)">
              <input
                type="number"
                min="1"
                max="60"
                name="break"
                defaultValue={p.break}
              />
            </Field>
            <Field label="Learning style">
              <select name="style" defaultValue={p.style}>
                {[
                  "University-style courses",
                  "Guided video courses",
                  "Project-based learning",
                  "A combination",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="AI assistance preference">
              <select name="assistance" defaultValue={p.assistance}>
                {["none", "hints", "substantial"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Preferred course providers">
              <input name="providers" defaultValue={p.providers} />
            </Field>
          </div>
          <Field label="Technical background">
            <textarea name="background" defaultValue={p.background} />
          </Field>
          <button className="primary" disabled={busy}>
            Save preferences
          </button>
        </form>
      </section>
      <section className="panel">
        <h2>Roadmap & progress</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const start = str(f, "start");
            mutate(
              (s) => ({
                ...s,
                preferences: {
                  ...s.preferences,
                  start,
                  activeWeek: num(f, "week"),
                  weights: {
                    lesson: num(f, "lesson"),
                    practice: num(f, "practice"),
                    assessment: num(f, "assessment"),
                    deliverable: num(f, "deliverable"),
                  },
                },
                tasks:
                  str(f, "reschedule") === "on"
                    ? s.tasks.map((t) =>
                        ["completed", "skipped"].includes(t.status)
                          ? t
                          : {
                              ...t,
                              scheduled: addDays(
                                start,
                                (t.week - 1) * 7 +
                                  Math.min(
                                    3,
                                    [
                                      "lesson",
                                      "practice",
                                      "assessment",
                                      "deliverable",
                                    ].indexOf(t.type),
                                  ),
                              ),
                            },
                      )
                    : s.tasks,
                projects:
                  str(f, "reschedule") === "on"
                    ? s.projects.map((p) =>
                        p.status === "completed"
                          ? p
                          : { ...p, target: addDays(start, p.week * 7 - 1) },
                      )
                    : s.projects,
              }),
              "Roadmap settings saved",
            );
          }}
        >
          <div className="two-cols">
            <Field label="Start date">
              <input type="date" name="start" defaultValue={p.start} required />
            </Field>
            <Field label="Current learning week">
              <select name="week" defaultValue={p.activeWeek}>
                {weeks.map((w) => (
                  <option value={w.number} key={w.number}>
                    Week {w.number}: {w.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="muted">
            Default target completion: {addDays(p.start, 364)}. Extend
            individual phases by rescheduling tasks and project deadlines in
            Planner and Projects.
          </p>
          <label className="checkbox-label">
            <input type="checkbox" name="reschedule" />
            Reschedule unfinished tasks and project targets relative to the new
            start date
          </label>
          <h3>Progress weights (must total 100)</h3>
          <div className="four-cols">
            {Object.entries(p.weights).map(([key, value]) => (
              <Field label={`${key} %`} key={key}>
                <input
                  name={key}
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={value}
                />
              </Field>
            ))}
          </div>
          <button>Save roadmap settings</button>
        </form>
      </section>
      <section className="panel">
        <h2>Appearance & reminders</h2>
        <Field label="Theme">
          <select
            value={p.theme}
            onChange={(e) => {
              const eventValue = e.target.value;
              mutate(
                (s) => ({
                  ...s,
                  preferences: {
                    ...s.preferences,
                    theme: eventValue as State["preferences"]["theme"],
                  },
                }),
                "Theme updated",
              );
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </Field>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={p.notifications}
            onChange={(e) => {
              const eventChecked = e.target.checked;
              mutate(
                (s) => ({
                  ...s,
                  preferences: {
                    ...s.preferences,
                    notifications: eventChecked,
                  },
                }),
                "Reminder preferences saved",
              );
            }}
          />
          Enable in-app reminders
        </label>
        <p className="muted">
          Reminders are evaluated inside the app. No background push or email
          delivery is configured.
        </p>
      </section>
      <section className="panel">
        <h2>Your data</h2>
        <p>
          {mode === "local"
            ? "Local mode stores data in this browser. Regularly export a backup."
            : "Cloud mode uses your authenticated Supabase account as the canonical store."}
        </p>
        <div className="actions">
          <button className="primary" onClick={exportData}>
            Export JSON backup
          </button>
          <Field label="Import a validated backup">
            <input
              type="file"
              accept="application/json,.json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                if (file.size > 5000000) {
                  setFileError("Backup must be under 5 MB");
                  return;
                }
                try {
                  const value = JSON.parse(await file.text());
                  if (
                    window.confirm(
                      "Replace your learning records with this backup?",
                    )
                  )
                    importData(value);
                  setFileError("");
                } catch {
                  setFileError(
                    "This file is not valid JSON. Existing records are unchanged.",
                  );
                }
              }}
            />
          </Field>
        </div>
        {fileError && <p role="alert">{fileError}</p>}
      </section>
      <section className="panel">
        <h2>Security & session</h2>
        <p>
          {mode === "local"
            ? "No account or authentication is used in local mode. Browser access controls protect this workspace."
            : "Your session is managed by Supabase Auth. Password changes require an authenticated session."}
        </p>
        {mode === "cloud" && (
          <>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const result = await supabase().auth.updateUser({
                  password: str(f, "password"),
                });
                setFileError(result.error?.message ?? "Password updated");
              }}
            >
              <Field label="New password">
                <input type="password" name="password" minLength={8} required />
              </Field>
              <button>Update password</button>
            </form>
            <button onClick={() => void supabase().auth.signOut()}>
              Sign out of this session
            </button>
          </>
        )}
      </section>
      <section className="panel danger-panel">
        <h2>Delete learning data</h2>
        <p>
          Erase personal records and restart onboarding. Export a backup first.
        </p>
        <button className="danger" onClick={() => setConfirm(true)}>
          {mode === "local" ? "Reset local data" : "Delete cloud learning data"}
        </button>
        {mode === "cloud" && (
          <p className="muted">
            Deleting the Supabase Auth identity additionally requires the
            project administrator; no service-role credential is exposed in this
            app.
          </p>
        )}
      </section>
      <Modal
        title="Confirm data deletion"
        open={confirm}
        onClose={() => setConfirm(false)}
      >
        <p>
          This permanently deletes learning progress, sessions, projects, notes
          and career records from the current workspace.
        </p>
        <div className="actions">
          <button onClick={() => setConfirm(false)}>Cancel</button>
          <button
            className="danger"
            onClick={() => {
              void reset();
              setConfirm(false);
            }}
          >
            Delete learning data
          </button>
        </div>
      </Modal>
    </>
  );
}

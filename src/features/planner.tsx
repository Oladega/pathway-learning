"use client";
import { useEffect, useState } from "react";
import { useStore } from "../components/provider";
import { Header, Field, Modal, Empty, str, num, uuid } from "../components/ui";
import { isoDay, addDays, weeks, studyDays } from "../data/seed";
import { monday, timerSeconds, weeklyHours } from "../lib/calculations";
import { TaskRow, TaskEditor } from "./learning";
import type { Task } from "../lib/schema";
export function Planner() {
  const { state, mutate, busy } = useStore(),
    [view, setView] = useState("Calendar"),
    [start, setStart] = useState(monday()),
    [day, setDay] = useState(isoDay()),
    [edit, setEdit] = useState<Task | null>(null),
    [adding, setAdding] = useState(false),
    [confirm, setConfirm] = useState(false),
    [seconds, setSeconds] = useState(timerSeconds(state.timer));
  useEffect(() => {
    const tick = () => setSeconds(timerSeconds(state.timer));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [state.timer]);
  const taskOptions = state.tasks.filter(
      (t) => !["completed", "skipped"].includes(t.status),
    ),
    timer = state.timer;
  function startTimer(taskId = "", courseLevel = 0) {
    mutate(
      (s) => ({
        ...s,
        timer: {
          running: true,
          started: Date.now(),
          elapsed: 0,
          taskId,
          courseLevel,
          kind: "focus",
        },
      }),
      "Focus session started",
      "/planner",
    );
  }
  function pause() {
    mutate((s) => ({
      ...s,
      timer: s.timer
        ? {
            ...s.timer,
            running: false,
            started: null,
            elapsed: timerSeconds(s.timer),
          }
        : null,
    }));
  }
  function resume() {
    mutate((s) => ({
      ...s,
      timer: s.timer
        ? { ...s.timer, running: true, started: Date.now() }
        : null,
    }));
  }
  function stop() {
    pause();
    setConfirm(true);
  }
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <>
      <Header
        title="Study planner"
        subtitle="Plan realistically, focus deeply, and record what you actually learned."
        actions={
          <button className="primary" onClick={() => setAdding(true)}>
            + Add task
          </button>
        }
      />
      <section className="timer-panel">
        <div>
          <span className="eyebrow">
            {timer?.kind === "break" ? "RECOVERY BREAK" : "FOCUS SESSION"}
          </span>
          <div className="timer-display" aria-live="off">
            {String(Math.floor(seconds / 3600)).padStart(2, "0")}:
            {String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </div>
          <p className="muted">
            {seconds >= state.preferences.focus * 60 && timer?.kind !== "break"
              ? "Focus target reached. Stop and reflect, or continue at your own pace."
              : `Focus ${state.preferences.focus} min · Break ${state.preferences.break} min · timer survives refresh`}
          </p>
        </div>
        <div className="timer-controls">
          {!timer ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                startTimer(str(f, "task"), num(f, "course"));
              }}
            >
              <Field label="Link to task">
                <select name="task">
                  <option value="">General study</option>
                  {taskOptions.map((t) => (
                    <option value={t.id} key={t.id}>
                      Week {t.week} · {t.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Course level">
                <select name="course">
                  <option value="0">No course</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option value={i + 1} key={i}>
                      Level {i + 1}
                    </option>
                  ))}
                </select>
              </Field>
              <button className="primary" disabled={busy}>
                Start focus session
              </button>
            </form>
          ) : (
            <>
              <p>
                {state.tasks.find((t) => t.id === timer.taskId)?.title ??
                  "General study"}
              </p>
              <div className="actions">
                {timer.running ? (
                  <button onClick={pause} disabled={busy}>
                    Pause
                  </button>
                ) : (
                  <button onClick={resume} disabled={busy}>
                    Resume
                  </button>
                )}
                <button className="primary" onClick={stop} disabled={busy}>
                  Stop & log session
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Discard this timer without creating a study log?",
                      )
                    )
                      mutate((s) => ({ ...s, timer: null }));
                  }}
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Start a break? Unlogged timer duration will be discarded.",
                      )
                    )
                      mutate((s) => ({
                        ...s,
                        timer: {
                          ...s.timer!,
                          kind: "break",
                          running: true,
                          started: Date.now(),
                          elapsed: 0,
                        },
                      }));
                  }}
                >
                  Start break
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <div className="toolbar">
        <div className="tabs">
          {["Calendar", "Agenda", "Task list", "History"].map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setStart(addDays(start, -7))}>
          ← Previous week
        </button>
        <button onClick={() => setStart(monday())}>This week</button>
        <button onClick={() => setStart(addDays(start, 7))}>Next week →</button>
        <button onClick={() => setConfirm(true)}>Log time manually</button>
      </div>
      {view === "Calendar" && (
        <div className="calendar">
          {days.map((d, i) => (
            <section className="calendar-day" key={d}>
              <h3>
                {studyDays[i].day.slice(0, 3)} <small>{d.slice(5)}</small>
              </h3>
              <small>
                {state.preferences.schedule[i]} hours planned ·{" "}
                {studyDays[i].focus}
              </small>
              {state.tasks
                .filter((t) => t.scheduled === d)
                .map((t) => (
                  <button
                    className={`calendar-task ${t.status === "completed" ? "done" : ""}`}
                    key={t.id}
                    onClick={() => setEdit(t)}
                  >
                    <b>{t.title}</b>
                    <small>
                      {t.estimate}m · {t.status.replace("_", " ")}
                    </small>
                  </button>
                ))}
              {!state.tasks.some((t) => t.scheduled === d) && (
                <p className="muted">Open study time</p>
              )}
            </section>
          ))}
        </div>
      )}
      {view === "Agenda" && (
        <section className="panel">
          <Field label="Agenda date">
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </Field>
          {state.tasks
            .filter((t) => t.scheduled === day)
            .map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          {!state.tasks.some((t) => t.scheduled === day) && (
            <Empty>No tasks today.</Empty>
          )}
        </section>
      )}
      {view === "Task list" && (
        <section className="panel">
          <h2>Scheduled work</h2>
          {state.tasks
            .filter(
              (t) => t.scheduled >= start && t.scheduled < addDays(start, 7),
            )
            .map((t) => (
              <div key={t.id}>
                <TaskRow task={t} />
                <button className="text-link" onClick={() => setEdit(t)}>
                  Edit task
                </button>
              </div>
            ))}
        </section>
      )}
      {view === "History" && (
        <section className="panel">
          <h2>Study history</h2>
          {state.sessions.length ? (
            state.sessions
              .slice()
              .reverse()
              .map((s) => (
                <article className="list-item" key={s.id}>
                  <div>
                    <b>
                      {s.subject} · {s.duration} minutes
                    </b>
                    <small>
                      {s.date} · confidence {s.confidence}/5 · AI assistance:{" "}
                      {s.assistance}
                    </small>
                    <p>{s.learned}</p>
                    {s.challenges && (
                      <p className="muted">Challenge: {s.challenges}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this study log?"))
                        mutate(
                          (st) => ({
                            ...st,
                            sessions: st.sessions.filter((x) => x.id !== s.id),
                          }),
                          "Study log deleted",
                        );
                    }}
                  >
                    Delete
                  </button>
                </article>
              ))
          ) : (
            <Empty>Your confirmed study sessions will appear here.</Empty>
          )}
        </section>
      )}
      <div className="two-cols">
        <section className="panel">
          <h2>Overdue work</h2>
          <p className="muted">
            Carry work forward when it fits your schedule. Nothing moves
            automatically.
          </p>
          {state.tasks
            .filter(
              (t) =>
                t.scheduled < isoDay() &&
                !["completed", "skipped"].includes(t.status),
            )
            .slice(0, 10)
            .map((t) => (
              <div className="list-item" key={t.id}>
                <span>
                  {t.title}
                  <small>{t.scheduled}</small>
                </span>
                <button onClick={() => setEdit(t)}>Reschedule</button>
              </div>
            ))}
          <button
            onClick={() => {
              let next = addDays(isoDay(), 1);
              while (
                state.preferences.schedule[
                  (new Date(next + "T12:00:00Z").getUTCDay() + 6) % 7
                ] === 0 &&
                next < addDays(isoDay(), 8)
              )
                next = addDays(next, 1);
              if (!state.preferences.schedule.some(Boolean)) return;
              if (
                window.confirm(`Move all unfinished overdue tasks to ${next}?`)
              )
                mutate(
                  (s) => ({
                    ...s,
                    tasks: s.tasks.map((t) =>
                      t.scheduled < isoDay() &&
                      !["completed", "skipped"].includes(t.status)
                        ? { ...t, scheduled: next }
                        : t,
                    ),
                  }),
                  "Unfinished work carried forward",
                );
            }}
          >
            Carry unfinished tasks to next study day
          </button>
        </section>
        <section className="panel">
          <h2>Your weekly rhythm</h2>
          <p>
            {weeklyHours(state).toFixed(1)} / {state.preferences.target} hours
            recorded this week.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              mutate(
                (s) => ({
                  ...s,
                  preferences: {
                    ...s.preferences,
                    schedule: studyDays.map((_, i) => num(f, `day-${i}`)),
                  },
                }),
                "Study schedule saved",
              );
            }}
          >
            {studyDays.map((d, i) => (
              <Field key={d.day} label={`${d.day}: ${d.focus}`}>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  name={`day-${i}`}
                  defaultValue={state.preferences.schedule[i]}
                />
              </Field>
            ))}
            <button>Save schedule</button>
          </form>
        </section>
      </div>
      <TaskEditor task={edit} onClose={() => setEdit(null)} />
      <Modal
        title="Add a learning task"
        open={adding}
        onClose={() => setAdding(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const id = uuid();
            mutate(
              (s) => ({
                ...s,
                tasks: [
                  ...s.tasks,
                  {
                    id,
                    week: num(f, "week"),
                    title: str(f, "title"),
                    description: str(f, "description"),
                    type: str(f, "type") as Task["type"],
                    status: "not_started",
                    estimate: num(f, "estimate"),
                    priority: "normal",
                    scheduled: str(f, "scheduled"),
                    notes: "",
                    links: [],
                    subtasks: [],
                    assistance: "none",
                    completedAt: null,
                  },
                ],
              }),
              "Task added",
            );
            setAdding(false);
          }}
        >
          <Field label="Title">
            <input name="title" required />
          </Field>
          <Field label="Description">
            <textarea name="description" />
          </Field>
          <Field label="Week">
            <select name="week" defaultValue={state.preferences.activeWeek}>
              {weeks.map((w) => (
                <option value={w.number} key={w.number}>
                  Week {w.number}: {w.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select name="type">
              <option value="practice">Practice</option>
              <option value="lesson">Learning</option>
              <option value="assessment">Assessment</option>
            </select>
          </Field>
          <Field label="Scheduled date">
            <input
              type="date"
              name="scheduled"
              required
              defaultValue={isoDay()}
            />
          </Field>
          <Field label="Estimate (minutes)">
            <input
              type="number"
              min="0"
              max="1440"
              name="estimate"
              defaultValue="60"
            />
          </Field>
          <button className="primary">Create task</button>
        </form>
      </Modal>
      <Modal
        title="Confirm study activity"
        open={confirm}
        onClose={() => setConfirm(false)}
      >
        <form
          key={`${confirm}-${timer?.taskId}`}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const duration = num(f, "duration");
            mutate(
              (s) => ({
                ...s,
                sessions: [
                  ...s.sessions,
                  {
                    id: uuid(),
                    date: str(f, "date"),
                    duration,
                    taskId: str(f, "task"),
                    courseLevel: s.timer?.courseLevel ?? 0,
                    subject: str(f, "subject"),
                    learned: str(f, "learned"),
                    challenges: str(f, "challenges"),
                    confidence: num(f, "confidence"),
                    assistance: str(f, "assistance") as Task["assistance"],
                  },
                ],
                timer: null,
              }),
              "Study session recorded",
              "/planner",
            );
            setConfirm(false);
          }}
        >
          <p>
            {timer?.kind === "break"
              ? "Breaks are not learning time. Enter only actual study minutes."
              : "Confirm actual focused time before recording. No log is created until you save."}
          </p>
          <Field label="Date">
            <input type="date" name="date" defaultValue={isoDay()} required />
          </Field>
          <Field label="Study duration (minutes)">
            <input
              type="number"
              name="duration"
              min="1"
              max="1440"
              step="1"
              required
              defaultValue={
                timer?.kind === "break"
                  ? 1
                  : Math.max(1, Math.round(seconds / 60))
              }
            />
          </Field>
          <Field label="Task">
            <select name="task" defaultValue={timer?.taskId ?? ""}>
              <option value="">General study</option>
              {state.tasks.map((t) => (
                <option value={t.id} key={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subject">
            <input
              name="subject"
              defaultValue={
                state.tasks.find((t) => t.id === timer?.taskId)?.title ??
                "Python"
              }
              required
            />
          </Field>
          <Field label="What did you learn?">
            <textarea name="learned" />
          </Field>
          <Field label="Challenges">
            <textarea name="challenges" />
          </Field>
          <Field label="Confidence">
            <select name="confidence" defaultValue="3">
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Field label="AI assistance">
            <select
              name="assistance"
              defaultValue={state.preferences.assistance}
            >
              <option value="none">No AI</option>
              <option value="hints">Hints</option>
              <option value="substantial">Substantial assistance</option>
            </select>
          </Field>
          <button className="primary" disabled={busy}>
            Save study log
          </button>
        </form>
      </Modal>
    </>
  );
}

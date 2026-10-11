import { addDays, isoDay, weeks, roleSkills } from "../data/seed";
import type { State, Task } from "./schema";
export function weekProgress(state: State, week: number) {
  const ts = state.tasks.filter((t) => t.week === week);
  return Object.entries(state.preferences.weights).reduce(
    (sum, [type, weight]) => {
      const group = ts.filter((t) => t.type === type);
      return (
        sum +
        (group.length
          ? (group.filter((t) => t.status === "completed").length /
              group.length) *
            weight
          : 0)
      );
    },
    0,
  );
}
export function phaseProgress(state: State, phase: string) {
  const ws = weeks.filter((w) => w.phase === phase);
  return ws.reduce((s, w) => s + weekProgress(state, w.number), 0) / ws.length;
}
export function roadmapProgress(state: State) {
  return weeks.reduce((s, w) => s + weekProgress(state, w.number), 0) / 52;
}
export function courseProgress(state: State, level: number) {
  const ls = state.lessons.filter((l) => l.level === level);
  return ls.length ? (ls.filter((l) => l.done).length / ls.length) * 100 : 0;
}
export function monday(day = isoDay()) {
  const dow = new Date(day + "T12:00:00Z").getUTCDay();
  return addDays(day, -((dow + 6) % 7));
}
export function weeklyHours(state: State, day = isoDay()) {
  const start = monday(day);
  return state.sessions
    .filter((s) => s.date >= start && s.date < addDays(start, 7))
    .reduce((s, x) => s + x.duration / 60, 0);
}
export function streak(state: State, day = isoDay()) {
  const days = new Set(
    state.sessions.filter((s) => s.duration > 0).map((s) => s.date),
  );
  let current = days.has(day) ? day : addDays(day, -1),
    n = 0;
  while (days.has(current)) {
    n++;
    current = addDays(current, -1);
  }
  return n;
}
export function timerSeconds(timer: State["timer"], now = Date.now()) {
  return timer
    ? Math.floor(
        timer.elapsed +
          (timer.running && timer.started !== null
            ? Math.max(0, now - timer.started) / 1000
            : 0),
      )
    : 0;
}
export function readiness(state: State, role: string) {
  const required = roleSkills[role] ?? [];
  const demonstrated = required.filter((skill) =>
    state.evidence.some(
      (e) =>
        e.skill === skill &&
        (e.kind !== "project" ||
          state.projects.find((p) => p.id === e.projectId)?.status ===
            "completed"),
    ),
  );
  return {
    required,
    demonstrated,
    score: required.length
      ? Math.round((demonstrated.length / required.length) * 100)
      : 0,
  };
}
export function recommendedTask(state: State) {
  const eligible = state.tasks.filter(
    (t) =>
      !["completed", "skipped"].includes(t.status) &&
      !state.preferences.pausedPhases.includes(weeks[t.week - 1].phase) &&
      weeks[t.week - 1].prerequisites.every(
        (w) => weekProgress(state, w) === 100,
      ),
  );
  return eligible.sort(
    (a, b) =>
      (a.week === state.preferences.activeWeek ? -1 : 0) -
        (b.week === state.preferences.activeWeek ? -1 : 0) ||
      a.scheduled.localeCompare(b.scheduled) ||
      { high: 0, normal: 1, low: 2 }[a.priority] -
        { high: 0, normal: 1, low: 2 }[b.priority],
  )[0];
}
export function phaseStatus(state: State, phase: string) {
  const ws = weeks.filter((w) => w.phase === phase),
    progress = phaseProgress(state, phase);
  return progress === 100
    ? "Completed"
    : state.preferences.pausedPhases.includes(phase)
      ? "Paused"
      : progress > 0
        ? "In progress"
        : ws[0].prerequisites.every((w) => weekProgress(state, w) === 100)
          ? "Available"
          : "Locked";
}
export function transitionTask(
  state: State,
  id: string,
  to: Task["status"],
  now = new Date().toISOString(),
): State {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) throw Error("Task not found");
  if (to === "completed" && task.subtasks.some((t) => !t.done))
    throw Error("Finish subtasks before completing this task");
  if (
    task.type === "deliverable" &&
    to === "completed" &&
    state.projects.find((p) => p.id === `week-${task.week}`)?.status !==
      "completed"
  )
    throw Error(
      "Complete the weekly project criteria, repository and retrospective first",
    );
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === id
        ? { ...t, status: to, completedAt: to === "completed" ? now : null }
        : t,
    ),
    lessons:
      task.type === "lesson"
        ? state.lessons.map((l) =>
            l.week === task.week ? { ...l, done: to === "completed" } : l,
          )
        : state.lessons,
  };
}
export function completeLesson(state: State, id: string, done: boolean): State {
  const lesson = state.lessons.find((l) => l.id === id);
  if (!lesson) throw Error("Lesson not found");
  const ls = state.lessons.map((l) => (l.id === id ? { ...l, done } : l));
  const all = ls.filter((l) => l.week === lesson.week).every((l) => l.done);
  return {
    ...state,
    lessons: ls,
    tasks: state.tasks.map((t) =>
      t.week === lesson.week && t.type === "lesson"
        ? {
            ...t,
            status: all ? "completed" : "not_started",
            completedAt: all ? new Date().toISOString() : null,
          }
        : t,
    ),
  };
}
export function notifications(state: State, day = isoDay()) {
  if (!state.preferences.notifications) return [];
  const items = [
    ...weeks
      .filter(
        (w) =>
          [8, 16, 24, 32, 40, 52].includes(w.number) &&
          phaseProgress(state, w.phase) === 100,
      )
      .map((w) => ({
        id: `phase-${w.phase}`,
        title: `Phase complete: ${w.phase}`,
        href: "/roadmap",
      })),
    ...Object.keys(state.courses)
      .filter((level) => courseProgress(state, Number(level)) === 100)
      .map((level) => ({
        id: `course-${level}`,
        title: `Course milestone: level ${level} topic tracker complete`,
        href: `/courses?level=${level}`,
      })),
    ...state.tasks
      .filter(
        (t) =>
          t.scheduled <= day && !["completed", "skipped"].includes(t.status),
      )
      .slice(0, 20)
      .map((t) => ({
        id: `task-${t.id}-${t.scheduled}`,
        title: t.scheduled < day ? `Overdue: ${t.title}` : `Today: ${t.title}`,
        href: `/roadmap?week=${t.week}`,
      })),
    ...state.jobs
      .filter(
        (j) =>
          j.followUp &&
          j.followUp <= day &&
          !["Rejected", "Withdrawn"].includes(j.status),
      )
      .map((j) => ({
        id: `job-${j.id}-${j.followUp}`,
        title: `Follow up with ${j.company}`,
        href: "/career",
      })),
    ...state.interviews
      .filter((i) => i.nextReview && i.nextReview <= day)
      .map((i) => ({
        id: `review-${i.id}-${i.nextReview}`,
        title: `Review ${i.topic}`,
        href: "/career",
      })),
    ...state.projects
      .filter(
        (p) => p.target <= day && !["completed", "archived"].includes(p.status),
      )
      .slice(0, 5)
      .map((p) => ({
        id: `project-${p.id}-${p.target}`,
        title: `Project due: ${p.title}`,
        href: `/projects?id=${p.id}`,
      })),
  ];
  if (weeklyHours(state, day) >= state.preferences.target)
    items.push({
      id: `goal-${monday(day)}`,
      title: "Weekly study goal achieved",
      href: "/analytics",
    });
  return items.filter((n) => state.notificationState[n.id] !== "dismissed");
}

import { describe, it, expect } from "vitest";
import {
  createInitial,
  weeks,
  phases,
  skills,
  addDays,
} from "../src/data/seed";
import { stateSchema, parseBackup } from "../src/lib/schema";
import {
  weekProgress,
  phaseProgress,
  roadmapProgress,
  courseProgress,
  weeklyHours,
  streak,
  timerSeconds,
  transitionTask,
  completeLesson,
  readiness,
  recommendedTask,
  notifications,
} from "../src/lib/calculations";
import { localPersistence } from "../src/lib/persistence";
import { mentorInput, mentorContext } from "../src/lib/ai/mentor";
import { authorized, boundedJson } from "../src/lib/database/server";
const day = "2026-10-12";
function initial() {
  return createInitial(day);
}
function session(date = day) {
  return {
    id: date,
    date,
    duration: 60,
    taskId: "",
    courseLevel: 0,
    subject: "Python",
    learned: "Functions",
    challenges: "Scope",
    confidence: 3,
    assistance: "none" as const,
  };
}
function memory() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}
describe("Complete canonical curriculum", () => {
  it("has 52 sequential weeks, six phases, content and measurable deliverables", () => {
    expect(weeks).toHaveLength(52);
    expect(phases).toHaveLength(6);
    expect(weeks.map((w) => w.number)).toEqual(
      Array.from({ length: 52 }, (_, i) => i + 1),
    );
    for (const w of weeks) {
      expect(w.topics.length).toBeGreaterThan(1);
      expect(w.objectives).toHaveLength(w.topics.length);
      expect(w.criteria.length).toBeGreaterThanOrEqual(3);
      expect(w.assessment).toHaveLength(3);
      expect(w.resources.length).toBeGreaterThan(0);
      expect(w.exercise.length).toBeGreaterThan(30);
      expect(w.hours).toBe(16);
      expect(w.prerequisites).toEqual(w.number === 1 ? [] : [w.number - 1]);
    }
  });
  it("includes required exact topics and projects", () => {
    expect(weeks[2].topics).toContain("pathlib");
    expect(weeks[2].deliverable).toBe(
      "CLI expense tracker with data persistence",
    );
    expect(weeks[29].deliverable).toBe("50-case AI evaluation suite");
    expect(weeks[51].deliverable).toBe(
      "Job-ready engineering portfolio and application strategy",
    );
  });
  it("starts with no invented achievements", () => {
    const s = initial();
    expect(stateSchema.safeParse(s).success).toBe(true);
    expect(roadmapProgress(s)).toBe(0);
    expect(streak(s, day)).toBe(0);
    expect(weeklyHours(s, day)).toBe(0);
    expect(s.evidence).toHaveLength(0);
    expect(s.projects.filter((p) => p.status === "completed")).toHaveLength(0);
    expect(s.tasks).toHaveLength(208);
    expect(skills.length).toBeGreaterThan(45);
  });
});
describe("Progress and task workflow", () => {
  it("lesson completion updates both course and weighted week; reset reverses it", () => {
    const s = completeLesson(initial(), "lesson-1", true);
    expect(courseProgress(s, 1)).toBe(25);
    expect(weekProgress(s, 1)).toBe(30);
    expect(phaseProgress(s, "python")).toBe(30 / 8);
    expect(roadmapProgress(s)).toBe(30 / 52);
    expect(s.skills).toEqual({});
    expect(weekProgress(completeLesson(s, "lesson-1", false), 1)).toBe(0);
  });
  it("all tracked lessons for a week must be complete", () => {
    const s = initial();
    s.lessons.push({ ...s.lessons[0], id: "extra" });
    const one = completeLesson(s, "lesson-1", true);
    expect(weekProgress(one, 1)).toBe(0);
    expect(weekProgress(completeLesson(one, "extra", true), 1)).toBe(30);
  });
  it("transitions start, pause, complete and reset and rejects unfinished subtasks", () => {
    let s = initial();
    s = transitionTask(s, "w1-practice", "in_progress");
    expect(s.tasks[1].status).toBe("in_progress");
    s = transitionTask(s, "w1-practice", "paused");
    expect(s.tasks[1].status).toBe("paused");
    s = transitionTask(s, "w1-practice", "completed");
    expect(weekProgress(s, 1)).toBe(40);
    expect(s.tasks[1].completedAt).toBeTruthy();
    s = transitionTask(s, "w1-practice", "not_started");
    expect(s.tasks[1].completedAt).toBeNull();
    s.tasks[1].subtasks.push({ id: "sub", title: "Write tests", done: false });
    expect(() => transitionTask(s, "w1-practice", "completed")).toThrow(
      "subtasks",
    );
  });
  it("deliverable requires a completed project", () =>
    expect(() =>
      transitionTask(initial(), "w1-deliverable", "completed"),
    ).toThrow("weekly project"));
  it("skipped work does not award completion", () =>
    expect(
      weekProgress(transitionTask(initial(), "w1-practice", "skipped"), 1),
    ).toBe(0));
  it("recommendations preserve prerequisite order and respect paused phases", () => {
    const s = initial();
    s.preferences.activeWeek = 25;
    expect(recommendedTask(s)?.week).toBe(1);
    s.preferences.pausedPhases = ["python"];
    expect(recommendedTask(s)).toBeUndefined();
  });
  it("course selection preserves completed lessons and roadmap work", () => {
    const s = completeLesson(initial(), "lesson-1", true);
    s.courses[1].choice = "alternative";
    expect(courseProgress(s, 1)).toBe(25);
    expect(weekProgress(s, 1)).toBe(30);
  });
});
describe("Study math and persistence", () => {
  it("calculates running, paused and resumed timestamps", () => {
    const t = {
      running: true,
      started: 1000,
      elapsed: 30,
      taskId: "",
      courseLevel: 0,
      kind: "focus" as const,
    };
    expect(timerSeconds(t, 61000)).toBe(90);
    expect(timerSeconds({ ...t, running: false }, 61000)).toBe(30);
    expect(timerSeconds({ ...t, elapsed: 90, started: 100000 }, 160000)).toBe(
      150,
    );
  });
  it("filters hours to week boundaries and calculates current/recent streak", () => {
    const s = initial();
    s.sessions = [
      session(day),
      session(addDays(day, -1)),
      session(addDays(day, -2)),
      session(addDays(day, -4)),
    ];
    expect(weeklyHours(s, day)).toBe(1);
    expect(streak(s, day)).toBe(3);
    expect(streak(s, addDays(day, 1))).toBe(3);
    expect(streak(s, addDays(day, 2))).toBe(0);
  });
  it("persists sessions, timer and completion across reload", async () => {
    const storage = memory(),
      p = localPersistence(storage),
      s = completeLesson(initial(), "lesson-1", true);
    s.sessions = [session()];
    s.timer = {
      running: true,
      started: 1000,
      elapsed: 20,
      taskId: "",
      courseLevel: 0,
      kind: "focus",
    };
    const saved = await p.save(s);
    expect(saved.revision).toBe(1);
    const loaded = await localPersistence(storage).load();
    expect(loaded?.sessions).toEqual(s.sessions);
    expect(loaded?.timer).toEqual(s.timer);
    expect(loaded?.lessons[0].done).toBe(true);
  });
  it("detects conflicting tab writes", async () => {
    const p = localPersistence(memory()),
      s = initial();
    await p.save(s);
    await expect(p.save(s)).rejects.toThrow("another tab");
  });
  it("surfaces storage failure and preserves invalid saved data", async () => {
    const storage = memory();
    storage.setItem("pathway-v2", "bad-json");
    await expect(localPersistence(storage).load()).rejects.toThrow();
    expect(storage.getItem("pathway-v2")).toBe("bad-json");
    const p = localPersistence({
      ...storage,
      setItem: () => {
        throw Error("Quota exceeded");
      },
    });
    await expect(p.save(initial())).rejects.toThrow();
  });
});
describe("Skill evidence and import validation", () => {
  it("does not claim readiness based on self-report alone", () => {
    const s = initial();
    s.skills.Python = 5;
    expect(readiness(s, "AI Product Engineer").score).toBe(0);
    s.evidence.push({
      id: "e1",
      skill: "Python",
      kind: "exercise",
      title: "Tested CLI",
      url: "https://example.com",
      projectId: "",
      createdAt: "2026-10-12",
    });
    expect(readiness(s, "AI Product Engineer").score).toBe(10);
  });
  it("completed project evidence becomes inactive if project is reopened", () => {
    const s = initial(),
      p = s.projects[0];
    s.evidence.push({
      id: "e",
      skill: "Python",
      kind: "project",
      title: p.title,
      url: "",
      projectId: p.id,
      createdAt: day,
    });
    expect(readiness(s, "AI Product Engineer").score).toBe(0);
    p.status = "completed";
    p.repo = "https://example.com";
    p.retrospective = "Learned persistence";
    p.checks = p.checks.map(() => true);
    expect(readiness(s, "AI Product Engineer").score).toBe(10);
    p.status = "in_review";
    expect(readiness(s, "AI Product Engineer").score).toBe(0);
  });
  it("accepts round trip and rejects malformed, unsafe and inconsistent records", () => {
    expect(parseBackup(JSON.parse(JSON.stringify(initial())))).toEqual(
      initial(),
    );
    expect(() => parseBackup({ version: 2 })).toThrow();
    const s = initial();
    s.preferences.weights.practice = 99;
    expect(() => parseBackup(s)).toThrow();
    s.preferences.weights.practice = 40;
    s.projects[0].repo = "javascript:alert(1)";
    expect(() => parseBackup(s)).toThrow();
    s.projects[0].repo = "";
    s.tasks.push(s.tasks[0]);
    expect(() => parseBackup(s)).toThrow();
  });
  it("validates completed project requirements and record references", () => {
    const s = initial();
    s.projects[0].status = "completed";
    expect(() => parseBackup(s)).toThrow();
    s.projects[0].status = "planned";
    s.sessions = [{ ...session(), taskId: "missing" }];
    expect(() => parseBackup(s)).toThrow();
  });
  it("validates actual calendar dates", () => {
    const s = initial();
    s.preferences.start = "2026-02-31";
    expect(() => parseBackup(s)).toThrow();
  });
});
describe("Authorization, mentor and notifications", () => {
  it("denies cloud access without configured mode/identity", async () => {
    await expect(
      authorized(new Request("http://localhost/api/state")),
    ).rejects.toThrow();
  });
  it("bounds requests and rejects invalid JSON", async () => {
    await expect(
      boundedJson(
        new Request("http://localhost", {
          method: "POST",
          body: "x".repeat(50),
        }),
        10,
      ),
    ).rejects.toThrow("large");
    await expect(
      boundedJson(
        new Request("http://localhost", { method: "POST", body: "bad" }),
      ),
    ).rejects.toThrow("JSON");
  });
  it("validates mentor mode, input limit and derives real context", () => {
    expect(
      mentorInput.safeParse({
        message: "x".repeat(12001),
        mode: "Hints only",
        purpose: "Debugging Help",
        conversation: "default",
      }).success,
    ).toBe(false);
    const s = completeLesson(initial(), "lesson-1", true);
    expect(mentorContext(s).completed).toContain(
      "Study: Python syntax, variables",
    );
  });
  it("honors notification disable, dismissal and read state", () => {
    const s = initial();
    const ns = notifications(s, day);
    expect(ns.length).toBeGreaterThan(0);
    s.notificationState[ns[0].id] = "dismissed";
    expect(notifications(s, day).some((n) => n.id === ns[0].id)).toBe(false);
    s.preferences.notifications = false;
    expect(notifications(s, day)).toEqual([]);
  });
});

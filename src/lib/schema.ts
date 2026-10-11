import { z } from "zod";
const text = z.string().max(20000);
const id = z.string().min(1).max(100);
export const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
    "Invalid date",
  );
const url = z.union([
  z.literal(""),
  z
    .string()
    .url()
    .max(2000)
    .refine((v) => /^https?:\/\//.test(v), "Use an http(s) URL"),
]);
export const assistance = z.enum(["none", "hints", "substantial"]);
export const status = z.enum([
  "not_started",
  "in_progress",
  "paused",
  "completed",
  "skipped",
]);
export const taskSchema = z.object({
  id,
  week: z.number().int().min(1).max(52),
  title: z.string().min(1).max(300),
  description: text,
  type: z.enum(["lesson", "practice", "assessment", "deliverable"]),
  status,
  estimate: z.number().min(0).max(1440),
  priority: z.enum(["low", "normal", "high"]),
  scheduled: date,
  notes: text,
  links: z.array(url).max(30),
  subtasks: z
    .array(
      z.object({ id, title: z.string().min(1).max(300), done: z.boolean() }),
    )
    .max(100),
  assistance,
  completedAt: z.string().nullable(),
});
export const sessionSchema = z.object({
  id,
  date,
  duration: z.number().min(1).max(1440),
  taskId: z.string().max(100),
  courseLevel: z.number().int().min(0).max(10),
  subject: z.string().min(1).max(300),
  learned: text,
  challenges: text,
  confidence: z.number().int().min(1).max(5),
  assistance,
});
export const lessonSchema = z.object({
  id,
  level: z.number().int().min(1).max(10),
  week: z.number().int().min(1).max(52),
  section: z.string().min(1).max(300),
  title: z.string().min(1).max(300),
  done: z.boolean(),
});
export const projectSchema = z
  .object({
    id,
    title: z.string().min(1).max(300),
    description: text,
    week: z.number().int().min(1).max(52),
    type: z.enum(["weekly", "capstone", "portfolio", "open-source"]),
    skills: z.array(id),
    criteria: z.array(z.string().min(1).max(500)).min(1).max(100),
    checks: z.array(z.boolean()).max(100),
    status: z.enum([
      "planned",
      "in_progress",
      "blocked",
      "in_review",
      "completed",
      "archived",
    ]),
    repo: url,
    demo: url,
    architecture: text,
    testing: text,
    retrospective: text,
    start: date,
    target: date,
    stack: text,
    screenshots: z.array(url).max(10),
  })
  .refine(
    (p) => p.criteria.length === p.checks.length,
    "Project criteria mismatch",
  );
export const noteSchema = z.object({
  id,
  title: z.string().min(1).max(300),
  body: text,
  tags: z.string().max(300),
  pinned: z.boolean(),
  type: z.string().max(100),
  week: z.number().int().min(0).max(52),
  course: z.number().int().min(0).max(10),
  project: z.string().max(100),
  updatedAt: z.string(),
});
export const evidenceSchema = z.object({
  id,
  skill: id,
  title: z.string().min(1).max(300),
  url,
  projectId: z.string().max(100),
  kind: z.enum([
    "project",
    "exercise",
    "assessment",
    "repository",
    "explanation",
  ]),
  createdAt: z.string(),
});
export const skillSchema = z.object({ name: id, category: id });
export const jobSchema = z.object({
  id,
  company: z.string().min(1).max(300),
  role: z.string().min(1).max(300),
  url,
  location: text,
  arrangement: text,
  date,
  status: z.enum([
    "Interested",
    "Applied",
    "Screening",
    "Interviewing",
    "Offer",
    "Rejected",
    "Withdrawn",
  ]),
  resume: text,
  contact: text,
  notes: text,
  nextAction: text,
  followUp: z.union([date, z.literal("")]),
});
export const interviewSchema = z.object({
  id,
  topic: id,
  question: text,
  difficulty: z.enum(["easy", "medium", "hard"]),
  attempts: z.number().int().min(0),
  confidence: z.number().int().min(0).max(5),
  notes: text,
  nextReview: z.union([date, z.literal("")]),
});
export const resourceSchema = z.object({
  id,
  title: z.string().min(1).max(300),
  url,
  category: text,
  notes: text,
  done: z.boolean(),
});
export const messageSchema = z.object({
  id,
  role: z.enum(["user", "assistant"]),
  body: text,
  createdAt: z.string(),
  conversation: id,
});
export const weightsSchema = z
  .object({
    lesson: z.number().min(0).max(100),
    practice: z.number().min(0).max(100),
    assessment: z.number().min(0).max(100),
    deliverable: z.number().min(0).max(100),
  })
  .refine(
    (w) => Object.values(w).reduce((a, b) => a + b, 0) === 100,
    "Weights must add to 100",
  );
export const preferencesSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.union([z.literal(""), z.string().email()]),
  avatar: url,
  background: text,
  career: id,
  experience: id,
  style: id,
  target: z.number().min(1).max(80),
  schedule: z.array(z.number().min(0).max(24)).length(7),
  start: date,
  activeWeek: z.number().int().min(1).max(52),
  theme: z.enum(["light", "dark", "system"]),
  focus: z.number().int().min(1).max(180),
  break: z.number().int().min(1).max(60),
  assistance,
  notifications: z.boolean(),
  providers: text,
  weights: weightsSchema,
  pausedPhases: z.array(id),
});
export const timerSchema = z.object({
  running: z.boolean(),
  started: z.number().nullable(),
  elapsed: z.number().min(0),
  taskId: z.string(),
  courseLevel: z.number().min(0).max(10),
  kind: z.enum(["focus", "break"]),
});
const courseProgress = z.object({
  choice: z.enum(["primary", "alternative"]),
  enrolled: z.boolean(),
  enrollment: z.union([date, z.literal("")]),
  target: z.union([date, z.literal("")]),
  rating: z.number().int().min(0).max(5),
  notes: text,
});
export const stateSchema = z
  .object({
    version: z.literal(2),
    revision: z.number().int().min(0),
    onboarded: z.boolean(),
    preferences: preferencesSchema,
    tasks: z.array(taskSchema).max(2000),
    lessons: z.array(lessonSchema).max(2000),
    courses: z.record(courseProgress),
    sessions: z.array(sessionSchema).max(10000),
    projects: z.array(projectSchema).max(200),
    notes: z.array(noteSchema).max(10000),
    evidence: z.array(evidenceSchema).max(10000),
    skills: z.record(z.number().int().min(0).max(5)),
    skillHistory: z
      .array(
        z.object({
          skill: id,
          level: z.number().int().min(0).max(5),
          at: z.string(),
        }),
      )
      .max(10000),
    resources: z.array(resourceSchema).max(500),
    jobs: z.array(jobSchema).max(2000),
    interviews: z.array(interviewSchema).max(500),
    checklist: z.record(z.boolean()),
    messages: z.array(messageSchema).max(2000),
    activity: z
      .array(z.object({ id, title: text, at: z.string(), href: text }))
      .max(2000),
    notificationState: z.record(z.enum(["read", "dismissed"])),
    timer: timerSchema.nullable(),
  })
  .superRefine((s, ctx) => {
    for (const key of [
      "tasks",
      "lessons",
      "sessions",
      "projects",
      "notes",
      "evidence",
      "resources",
      "jobs",
      "interviews",
      "messages",
      "activity",
    ] as const) {
      const ids = s[key].map((x) => x.id);
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate identifiers in ${key}`,
        });
    }
    for (let level = 1; level <= 10; level++)
      if (!s.courses[level])
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Backup is missing a required course level",
        });
    for (let week = 1; week <= 52; week++) {
      if (
        !s.projects.some((p) => p.id === `week-${week}` && p.week === week) ||
        !s.lessons.some((l) => l.week === week) ||
        !(["lesson", "practice", "assessment", "deliverable"] as const).every(
          (type) => s.tasks.some((t) => t.week === week && t.type === type),
        )
      )
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Backup is missing required curriculum records",
        });
    }
    if (s.timer?.taskId && !s.tasks.some((t) => t.id === s.timer!.taskId))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Timer references a missing task",
      });
    const pids = new Set(s.projects.map((p) => p.id));
    const tids = new Set(s.tasks.map((t) => t.id));
    if (s.evidence.some((e) => e.projectId && !pids.has(e.projectId)))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Evidence references a missing project",
      });
    if (s.sessions.some((e) => e.taskId && !tids.has(e.taskId)))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Session references a missing task",
      });
    if (
      s.projects.some(
        (p) =>
          p.status === "completed" &&
          (!p.checks.every(Boolean) || !p.repo || !p.retrospective.trim()),
      )
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Completed projects require criteria, repository and retrospective",
      });
  });
export type State = z.infer<typeof stateSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Note = z.infer<typeof noteSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Job = z.infer<typeof jobSchema>;
export function parseBackup(input: unknown): State {
  return stateSchema.parse(input);
}

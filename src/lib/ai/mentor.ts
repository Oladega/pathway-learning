import { z } from "zod";
import { weeks } from "../../data/seed";
import type { State } from "../schema";
import { selectedTitle } from "./utils";
export const mentorInput = z
  .object({
    message: z.string().trim().min(1).max(12000),
    mode: z.enum(["Hints only", "Guided explanation", "Full explanation"]),
    purpose: z.enum([
      "Explain a Concept",
      "Debugging Help",
      "Study Plan",
      "Project Guidance",
      "Code Review",
      "Assessment",
      "Career Guidance",
    ]),
    conversation: z.string().min(1).max(100),
  })
  .strict();
export function mentorContext(state: State) {
  const p = state.preferences;
  return {
    week: weeks[p.activeWeek - 1],
    career: p.career,
    targetHours: p.target,
    courses: selectedTitle(state),
    completed: state.tasks
      .filter((t) => t.status === "completed")
      .map((t) => t.title)
      .slice(-30),
    projects: state.projects
      .filter((p) =>
        ["in_progress", "in_review", "completed"].includes(p.status),
      )
      .slice(0,10).map((p) => ({ title: p.title, status: p.status, criteria: p.criteria.slice(0,6) })),
    skills: Object.fromEntries(Object.entries(state.skills).slice(0,60)),
    evidence: state.evidence.slice(-20).map(e=>({skill:e.skill,title:e.title,kind:e.kind})),
    studyHistory: state.sessions.slice(-5).map(s=>({date:s.date,duration:s.duration,subject:s.subject,learned:s.learned.slice(0,600),challenges:s.challenges.slice(0,300),assistance:s.assistance})),
  };
}

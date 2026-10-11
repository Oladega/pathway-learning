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
      .slice(-50),
    projects: state.projects
      .filter((p) =>
        ["in_progress", "in_review", "completed"].includes(p.status),
      )
      .map((p) => ({ title: p.title, status: p.status, criteria: p.criteria })),
    skills: state.skills,
    evidence: state.evidence.slice(-20),
    studyHistory: state.sessions.slice(-10),
  };
}

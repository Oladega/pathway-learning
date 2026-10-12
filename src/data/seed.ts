import weeksData from "./curriculum/weeks.json";
import { courses, phases, projects as portfolio, studyDays } from "./catalog";
import type { State, Project } from "../lib/schema";
export { courses, phases, studyDays };
export const weeks = weeksData;
export const skills = Object.entries({
  Programming: ["Python", "JavaScript", "TypeScript", "SQL"],
  Engineering: [
    "Git",
    "Debugging",
    "Testing",
    "Data structures",
    "Algorithms",
    "OOP",
    "System design",
  ],
  Backend: [
    "REST APIs",
    "FastAPI",
    "Authentication",
    "PostgreSQL",
    "Async programming",
  ],
  Frontend: ["React", "Next.js", "State management", "Accessibility"],
  Mathematics: [
    "Linear algebra",
    "Probability",
    "Statistics",
    "Calculus",
    "Optimization",
  ],
  "Machine learning": [
    "Data preprocessing",
    "Feature engineering",
    "Regression",
    "Classification",
    "Model evaluation",
    "scikit-learn",
  ],
  "Deep learning": [
    "Neural networks",
    "Backpropagation",
    "PyTorch",
    "Transformers",
    "Fine-tuning",
  ],
  "AI engineering": [
    "Model APIs",
    "Prompting",
    "Structured outputs",
    "RAG",
    "Embeddings",
    "Tool calling",
    "Agents",
    "Evaluations",
    "AI security",
  ],
  Infrastructure: [
    "Docker",
    "CI/CD",
    "Cloud",
    "Monitoring",
    "Performance optimization",
  ],
}).flatMap(([category, list]) => list.map((name) => ({ name, category })));
export const roleSkills: Record<string, string[]> = {
  "Junior Software Engineer": [
    "Python",
    "Git",
    "Debugging",
    "Testing",
    "Data structures",
    "Algorithms",
  ],
  "Python Backend Developer": [
    "Python",
    "FastAPI",
    "REST APIs",
    "PostgreSQL",
    "Authentication",
    "Testing",
    "Cloud",
  ],
  "Full-Stack Engineer": [
    "Python",
    "TypeScript",
    "React",
    "Next.js",
    "REST APIs",
    "PostgreSQL",
    "Testing",
    "Cloud",
  ],
  "AI Product Engineer": [
    "Python",
    "TypeScript",
    "REST APIs",
    "PostgreSQL",
    "React",
    "Model APIs",
    "RAG",
    "Evaluations",
    "Cloud",
    "Testing",
  ],
  "LLM Application Engineer": [
    "Python",
    "Model APIs",
    "Prompting",
    "Structured outputs",
    "RAG",
    "Embeddings",
    "Tool calling",
    "Evaluations",
  ],
  "Applied AI Engineer": [
    "Python",
    "Model APIs",
    "RAG",
    "Model evaluation",
    "scikit-learn",
    "Testing",
    "Cloud",
  ],
  "Machine Learning Engineer": [
    "Python",
    "Linear algebra",
    "Statistics",
    "Feature engineering",
    "Model evaluation",
    "scikit-learn",
    "PyTorch",
    "Docker",
    "Monitoring",
  ],
};
export const portfolioChecklist = [
  "GitHub profile prepared",
  "Portfolio website updated",
  "Three case studies published",
  "Technical CV completed",
  "Project architecture diagrams added",
  "Repository READMEs reviewed",
  "Live demos available",
  "Interview introduction prepared",
  "Mock interviews completed",
];
export const interviewTopics = [
  "Python coding",
  "Data structures",
  "Algorithms",
  "SQL",
  "Backend design",
  "API design",
  "System design",
  "AI application architecture",
  "RAG and retrieval",
  "ML fundamentals",
  "Model evaluation",
  "Debugging",
  "Behavioral interviews",
];
export const questions = [
  "Implement a frequency counter and explain its complexity.",
  "When would you use a stack instead of a queue?",
  "Compare binary search with linear search.",
  "Write a query for monthly spending by category.",
  "How do you protect user-specific API records?",
  "Design idempotent transaction creation.",
  "Design a reliable asynchronous inference service.",
  "How would you evaluate an AI financial assistant?",
  "How do you measure retrieval quality and cite sources?",
  "Explain leakage and your train/test split strategy.",
  "When is accuracy misleading?",
  "Describe your process for reproducing a failing test.",
  "Describe a technical tradeoff and what you learned.",
];
export function isoDay(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
export function addDays(day: string, n: number) {
  return new Date(Date.parse(day + "T12:00:00Z") + n * 86400000)
    .toISOString()
    .slice(0, 10);
}
const weekSkillMap: Record<number, string[]> = {
  1: ["Python"],
  2: ["Python", "Data structures"],
  3: ["Python", "Debugging"],
  4: ["Python", "OOP", "Testing"],
  5: ["Algorithms", "Data structures"],
  6: ["Algorithms", "Data structures"],
  7: ["Python", "REST APIs"],
  8: ["Python", "Git", "Testing"],
  9: ["REST APIs"],
  10: ["FastAPI", "REST APIs"],
  11: ["SQL", "PostgreSQL"],
  12: ["PostgreSQL", "FastAPI"],
  13: ["Authentication", "AI security"],
  14: ["Testing", "Debugging"],
  15: ["Async programming"],
  16: ["FastAPI", "Authentication", "Cloud"],
  17: ["JavaScript"],
  18: ["TypeScript"],
  19: ["React", "State management"],
  20: ["React", "REST APIs"],
  21: ["Next.js"],
  22: ["Accessibility", "Testing"],
  23: ["CI/CD", "Cloud"],
  24: ["React", "Next.js", "TypeScript", "FastAPI", "PostgreSQL"],
  25: ["Model APIs", "Prompting"],
  26: ["Model APIs", "Structured outputs", "Tool calling"],
  27: ["Embeddings"],
  28: ["RAG", "Embeddings", "PostgreSQL"],
  29: ["Agents", "Tool calling", "State management"],
  30: ["Evaluations"],
  31: ["AI security", "Monitoring"],
  32: ["RAG", "Agents", "Evaluations", "Cloud"],
  33: ["Linear algebra"],
  34: ["Probability", "Statistics"],
  35: ["Calculus", "Optimization", "Regression"],
  36: ["Regression", "Model evaluation"],
  37: ["Classification", "scikit-learn"],
  38: ["Feature engineering", "Data preprocessing"],
  39: ["Model evaluation"],
  40: ["Model evaluation", "REST APIs", "Cloud"],
  41: ["Neural networks", "Backpropagation", "PyTorch"],
  42: ["PyTorch", "Classification"],
  43: ["Transformers", "Linear algebra"],
  44: ["Model APIs", "REST APIs"],
  45: ["Fine-tuning", "Model evaluation"],
  46: ["System design", "Performance optimization"],
  47: ["Monitoring"],
  48: ["Docker", "CI/CD", "Cloud"],
  49: ["AI security", "Performance optimization"],
  50: ["Git", "System design"],
  51: ["Algorithms", "SQL", "Debugging", "System design"],
  52: ["Git"],
};
export function weekSkills(n: number): string[] {
  return [...new Set([...(weekSkillMap[n] ?? []), "Testing"])];
}
export function createInitial(today = isoDay()): State {
  const tasks = weeks.flatMap((w) =>
    (["lesson", "practice", "assessment", "deliverable"] as const).map(
      (type, i) => ({
        id: `w${w.number}-${type}`,
        week: w.number,
        title:
          type === "lesson"
            ? `Study: ${w.title}`
            : type === "practice"
              ? `Practice: ${w.topics[0]}`
              : type === "assessment"
                ? `Knowledge check: week ${w.number}`
                : w.deliverable,
        description:
          type === "practice"
            ? w.exercise
            : type === "assessment"
              ? w.assessment.join("\n")
              : type === "deliverable"
                ? w.criteria.join("\n")
                : w.objectives.join("\n"),
        type,
        status: "not_started" as const,
        estimate: [240, 360, 120, 240][i],
        priority: "normal" as const,
        scheduled: addDays(today, (w.number - 1) * 7 + i),
        notes: "",
        links: [],
        subtasks: [],
        assistance: "none" as const,
        completedAt: null,
      }),
    ),
  );
  const projectDefaults = {
    status: "planned" as const,
    repo: "",
    demo: "",
    architecture: "",
    testing: "",
    retrospective: "",
    start: today,
    stack: "",
    screenshots: [],
  };
  const weekly: Project[] = weeks.map((w) => ({
    ...projectDefaults,
    id: `week-${w.number}`,
    title: w.deliverable,
    description: w.description + " " + w.exercise,
    week: w.number,
    type: [8, 16, 24, 32, 40, 52].includes(w.number) ? "capstone" : "weekly",
    skills: weekSkills(w.number),
    criteria: w.criteria,
    checks: w.criteria.map(() => false),
    target: addDays(today, w.number * 7 - 1),
    stack: w.topics.join(", "),
  }));
  const major: Project[] = portfolio.map((p, i) => ({
    ...projectDefaults,
    id: p.id,
    title:
      i === 0
        ? "Personal Finance SaaS"
        : i === 2
          ? "Intelligent Risk Analysis Platform"
          : p.name,
    description: p.description,
    week: p.week,
    type: "portfolio",
    skills:
      i === 0
        ? [
            "Python",
            "FastAPI",
            "PostgreSQL",
            "React",
            "TypeScript",
            "Testing",
            "Cloud",
          ]
        : i === 1
          ? [
              "Model APIs",
              "Embeddings",
              "RAG",
              "Agents",
              "Evaluations",
              "AI security",
            ]
          : ["Python", "scikit-learn", "PyTorch", "Docker", "Model evaluation"],
    criteria:
      i === 0
        ? [
            "Authentication and per-user authorization",
            "Transaction management and categorization",
            "Persisted database and API integration",
            "Analytics and user settings",
            "Deployment and automated tests",
            "Architecture and published case study",
          ]
        : i === 1
          ? [
              "Document upload and text extraction",
              "Semantic indexing and retrieval",
              "Generated answers with source citations",
              "Financial calculation tools",
              "Response evaluation and logging",
              "Secure API architecture and deployment",
            ]
          : [
              "Public or synthetic dataset and feature engineering",
              "Model training and evaluation",
              "Versioned prediction API and dashboard",
              "Error analysis and documented limitations",
              "Deployment and automated tests",
            ],
    checks: Array(i === 2 ? 5 : 6).fill(false),
    stack: p.skills.join(", "),
    target: addDays(today, p.week * 7 - 1),
  }));
  return {
    version: 2,
    revision: 0,
    onboarded: false,
    preferences: {
      name: "Kati",
      email: "",
      avatar: "",
      background: "Product Designer · Electronics and Computer Engineering",
      career: "AI Product Engineer",
      experience:
        "I understand basic programming but cannot build independently",
      style: "A combination",
      target: 16,
      schedule: [2, 2, 2, 2, 1, 5, 2],
      start: today,
      activeWeek: 1,
      theme: "system",
      focus: 25,
      break: 5,
      assistance: "hints",
      notifications: true,
      providers: "University courses and project-based learning",
      weights: { lesson: 30, practice: 40, assessment: 10, deliverable: 20 },
      pausedPhases: [],
    },
    tasks,
    lessons: weeks.map((w) => ({
      id: `lesson-${w.number}`,
      level: w.courseLevel,
      week: w.number,
      section: phases.find((p) => p.id === w.phase)!.name,
      title: w.title,
      done: false,
    })),
    courses: Object.fromEntries(
      courses.map((c) => [
        String(c.level),
        {
          choice: "primary",
          enrolled: false,
          enrollment: "",
          target: "",
          rating: 0,
          notes: "",
        },
      ]),
    ),
    sessions: [],
    projects: [...weekly, ...major],
    notes: [],
    evidence: [],
    skills: {},
    skillHistory: [],
    resources: [
      ...new Map(
        weeks.flatMap((w) => w.resources.map((r) => [r.url, r] as const)),
      ).values(),
    ].map((r, i) => ({
      id: `resource-${i}`,
      ...r,
      category: "Documentation",
      notes: "",
      done: false,
    })),
    jobs: [],
    interviews: interviewTopics.map((topic, i) => ({
      id: `interview-${i}`,
      topic,
      question: questions[i],
      difficulty: "medium",
      attempts: 0,
      confidence: 0,
      notes: "",
      nextReview: "",
    })),
    checklist: {},
    messages: [],
    activity: [],
    notificationState: {},
    timer: null,
  };
}

export type Week = { title: string; topics: string; deliverable: string };
export type Phase = {
  id: string;
  name: string;
  short: string;
  range: string;
  description: string;
  color: string;
  weeks: Week[];
};
export type Course = {
  level: number;
  name: string;
  provider: string;
  url: string;
  alternative: string;
  author: string;
  alternativeUrl: string;
  phase: string;
  duration: string;
  note: string;
};
export const phases: Phase[] = [
  {
    id: "python",
    name: "Python & Computer Science",
    short: "Programming fundamentals",
    range: "Weeks 01–08",
    description:
      "Become confident writing and debugging code without assistance.",
    color: "#7764dc",
    weeks: [
      {
        title: "Python syntax and logic",
        topics: "Variables, types, conditionals, loops, functions",
        deliverable: "Calculator, number guessing game and expense splitter",
      },
      {
        title: "Data structures",
        topics: "Lists, tuples, dictionaries, sets, comprehensions",
        deliverable: "Command-line task manager with search and filtering",
      },
      {
        title: "Functions and files",
        topics: "Modules, exceptions, CSV, JSON, pathlib",
        deliverable: "Expense tracker that saves records and monthly totals",
      },
      {
        title: "Object-oriented programming",
        topics: "Classes, objects, methods, pytest, debugging",
        deliverable: "Bank account simulator with deposits and withdrawals",
      },
      {
        title: "Algorithms I",
        topics: "Arrays, strings, hash maps, sorting, Big O",
        deliverable: "Searching, sorting, and 10 algorithm exercises",
      },
      {
        title: "Algorithms II",
        topics: "Stacks, queues, recursion, linked lists",
        deliverable: "Browser-history simulator using stacks",
      },
      {
        title: "APIs and automation",
        topics: "HTTP, requests, JSON, secrets, CLI arguments",
        deliverable: "Currency-rate fetcher with caching and error handling",
      },
      {
        title: "Python capstone",
        topics: "Project structure, tests, Git, documentation",
        deliverable: "Publish a tested personal finance CLI on GitHub",
      },
    ],
  },
  {
    id: "backend",
    name: "Backend Engineering",
    short: "APIs, databases & security",
    range: "Weeks 09–16",
    description: "Build robust Python APIs and persistent applications.",
    color: "#4f94c8",
    weeks: [
      {
        title: "Web fundamentals",
        topics: "HTTP, DNS, client-server, REST, status codes",
        deliverable: "API client consuming a public service",
      },
      {
        title: "FastAPI basics",
        topics: "Routes, validation, Pydantic, API documentation",
        deliverable: "CRUD notes API",
      },
      {
        title: "SQL fundamentals",
        topics: "SELECT, JOIN, GROUP BY, transactions and indexes",
        deliverable: "PostgreSQL schema for an expense tracker",
      },
      {
        title: "Database integration",
        topics: "SQLAlchemy, ORM, migrations, relationships",
        deliverable: "Connect notes API to PostgreSQL",
      },
      {
        title: "Authentication",
        topics: "Password hashing, sessions, JWT, authorization",
        deliverable: "Add signup, login and record ownership",
      },
      {
        title: "Testing and debugging",
        topics: "pytest, integration testing, mocking, logging",
        deliverable: "Automated tests for CRUD, auth and errors",
      },
      {
        title: "Async and services",
        topics: "async/await, concurrency, external APIs, retries",
        deliverable: "Fetch and persist external data reliably",
      },
      {
        title: "Backend capstone",
        topics: "Configuration, deployment, API security",
        deliverable: "Deploy multi-user personal finance API",
      },
    ],
  },
  {
    id: "fullstack",
    name: "Full-Stack Development",
    short: "TypeScript, React & deployment",
    range: "Weeks 17–24",
    description: "Build polished products from a blank repository.",
    color: "#df9956",
    weeks: [
      {
        title: "JavaScript fundamentals",
        topics: "Variables, arrays, objects, promises, async/await",
        deliverable: "Dashboard consuming a public API",
      },
      {
        title: "TypeScript",
        topics: "Types, interfaces, unions, generics, narrowing",
        deliverable: "Convert dashboard to TypeScript",
      },
      {
        title: "React fundamentals",
        topics: "Components, props, state, effects, forms",
        deliverable: "Interactive transaction dashboard",
      },
      {
        title: "React + APIs",
        topics: "Fetching, mutations, loading and error states",
        deliverable: "Connect dashboard to finance backend",
      },
      {
        title: "Next.js",
        topics: "Routing, rendering, server/client components",
        deliverable: "Rebuild frontend with Next.js",
      },
      {
        title: "Frontend architecture",
        topics: "Validation, reusable components, accessibility",
        deliverable: "Account and settings flows",
      },
      {
        title: "Deployment",
        topics: "Hosting, CI, environment variables, builds",
        deliverable: "Deploy frontend and backend",
      },
      {
        title: "Full-stack capstone",
        topics: "Architecture, refactoring, testing, docs",
        deliverable: "Ship personal finance SaaS and case study",
      },
    ],
  },
  {
    id: "llm",
    name: "LLM & Agent Engineering",
    short: "Retrieval, tools & evaluations",
    range: "Weeks 25–32",
    description: "Build production-minded AI apps with measurable quality.",
    color: "#62a789",
    weeks: [
      {
        title: "LLM fundamentals",
        topics: "Tokens, contexts, prompting, inference, limitations",
        deliverable: "Document summarizer",
      },
      {
        title: "Model APIs",
        topics: "SDKs, structured outputs, tools, streaming",
        deliverable: "Finance assistant with validated JSON",
      },
      {
        title: "Embeddings",
        topics: "Vectors, similarity, semantic search",
        deliverable: "Semantic search across financial documents",
      },
      {
        title: "Retrieval-augmented generation",
        topics: "Chunking, retrieval, pgvector, citations",
        deliverable: "Grounded document Q&A system",
      },
      {
        title: "Agent workflows",
        topics: "Tool orchestration, state, permissions, approvals",
        deliverable: "Assistant that queries and updates records",
      },
      {
        title: "Evaluation",
        topics: "Golden datasets, retrieval metrics, task success",
        deliverable: "50-case evaluation suite",
      },
      {
        title: "AI reliability and security",
        topics: "Prompt injection, rate limits, retries, cost",
        deliverable: "Harden agent with confirmation screens",
      },
      {
        title: "AI product capstone",
        topics: "Tracing, evaluation, architecture, deployment",
        deliverable: "Launch AI financial research assistant",
      },
    ],
  },
  {
    id: "ml",
    name: "Math & Machine Learning",
    short: "Statistics, models & evaluation",
    range: "Weeks 33–40",
    description: "Understand why models work and train your own.",
    color: "#dd8ba3",
    weeks: [
      {
        title: "Linear algebra",
        topics: "Vectors, matrices, projections, dot products",
        deliverable: "Vector similarity calculator with NumPy",
      },
      {
        title: "Probability and statistics",
        topics: "Conditional probability, distributions, sampling",
        deliverable: "Analyze transaction data with pandas",
      },
      {
        title: "Calculus and optimization",
        topics: "Derivatives, gradients, gradient descent",
        deliverable: "Linear regression from scratch",
      },
      {
        title: "Classical ML I",
        topics: "Regression, train/test split, loss and metrics",
        deliverable: "Predict numerical values from financial data",
      },
      {
        title: "Classical ML II",
        topics: "Classification, decision trees, forests",
        deliverable: "Transaction anomaly classifier",
      },
      {
        title: "Feature engineering",
        topics: "Missing data, encoding, leakage, cross-validation",
        deliverable: "Improved reproducible training pipeline",
      },
      {
        title: "Model evaluation",
        topics: "Confusion matrices, ROC-AUC, calibration",
        deliverable: "Compare three models on held-out data",
      },
      {
        title: "ML capstone",
        topics: "Training pipelines, reproducibility, inference",
        deliverable: "Deploy documented risk-classification model",
      },
    ],
  },
  {
    id: "production",
    name: "Deep Learning & Production",
    short: "PyTorch, infrastructure & career",
    range: "Weeks 41–52",
    description: "Build, ship and defend the architecture of real AI systems.",
    color: "#7894d4",
    weeks: [
      {
        title: "Neural network fundamentals",
        topics: "Tensors, activations, loss, backpropagation",
        deliverable: "Train neural network in PyTorch",
      },
      {
        title: "Deep learning workflows",
        topics: "DataLoader, optimizers, checkpoints, training",
        deliverable: "Text classification model",
      },
      {
        title: "Transformers",
        topics: "Attention, tokenization, transformer architecture",
        deliverable: "Implement a simple attention mechanism",
      },
      {
        title: "Open-weight models",
        topics: "Hugging Face Transformers, inference, selection",
        deliverable: "Serve a small open model",
      },
      {
        title: "Fine-tuning",
        topics: "Transfer learning, LoRA, data quality",
        deliverable: "Fine-tune and benchmark a small model",
      },
      {
        title: "AI system design",
        topics: "Caching, queues, gateways, latency",
        deliverable: "Implement inference architecture",
      },
      {
        title: "Observability",
        topics: "Structured logs, tracing, tokens and cost",
        deliverable: "AI application metrics and traces",
      },
      {
        title: "DevOps and deployment",
        topics: "Docker, CI/CD, secrets, cloud monitoring",
        deliverable: "Containerize and deploy strongest project",
      },
      {
        title: "Performance and security",
        topics: "Load testing, indexing, access control",
        deliverable: "Stress test and harden AI application",
      },
      {
        title: "Portfolio polish",
        topics: "READMEs, diagrams, case studies, tradeoffs",
        deliverable: "Publish three technical case studies",
      },
      {
        title: "Interview preparation",
        topics: "Coding patterns, SQL, debugging, design",
        deliverable: "Three mock engineering interviews",
      },
      {
        title: "Job applications",
        topics: "CV, outreach, applications, technical interviews",
        deliverable: "Apply to targeted AI engineering roles",
      },
    ],
  },
];
export const allWeeks = phases.flatMap((p, pi) =>
  p.weeks.map((w, i) => ({
    ...w,
    number: phases.slice(0, pi).reduce((s, x) => s + x.weeks.length, 0) + i + 1,
    phase: p.id,
    phaseName: p.name,
    color: p.color,
  })),
);
export const courses: Course[] = [
  {
    level: 1,
    name: "CS50 Introduction to Programming with Python",
    provider: "Harvard · Free",
    url: "https://cs50.harvard.edu/python/",
    alternative: "100 Days of Code: Python Bootcamp",
    author: "Angela Yu · Udemy",
    alternativeUrl: "https://www.udemy.com/course/100-days-of-code/",
    phase: "python",
    duration: "Weeks 1–8",
    note: "Use as your primary foundation. Do assignments without copying solutions.",
  },
  {
    level: 2,
    name: "CS50x: Introduction to Computer Science",
    provider: "Harvard · Free",
    url: "https://cs50.harvard.edu/x/",
    alternative: "Python Data Structures and Algorithms",
    author: "Udemy",
    alternativeUrl:
      "https://www.udemy.com/course/algorithms-and-data-structures-in-python/",
    phase: "python",
    duration: "Weeks 5–12",
    note: "Focus on memory, problem-solving, algorithms and data structures.",
  },
  {
    level: 3,
    name: "FastAPI Official Tutorial",
    provider: "FastAPI · Free",
    url: "https://fastapi.tiangolo.com/tutorial/",
    alternative: "FastAPI: The Complete Course",
    author: "Eric Roby · Udemy",
    alternativeUrl: "https://www.udemy.com/course/fastapi-the-complete-course/",
    phase: "backend",
    duration: "Weeks 9–16",
    note: "Build real APIs with authentication, databases and tests.",
  },
  {
    level: 4,
    name: "SQLBolt Interactive SQL Lessons",
    provider: "SQLBolt · Free",
    url: "https://sqlbolt.com/",
    alternative: "The Complete SQL Bootcamp",
    author: "Jose Portilla · Udemy",
    alternativeUrl: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
    phase: "backend",
    duration: "Weeks 11–16",
    note: "Apply database concepts inside your FastAPI projects.",
  },
  {
    level: 5,
    name: "Full Stack Open",
    provider: "University of Helsinki · Free",
    url: "https://fullstackopen.com/en/",
    alternative: "React: The Complete Guide",
    author: "Maximilian Schwarzmüller · Udemy",
    alternativeUrl:
      "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
    phase: "fullstack",
    duration: "Weeks 17–24",
    note: "Learn JavaScript first at javascript.info, then React and TypeScript.",
  },
  {
    level: 6,
    name: "Hugging Face Agents Course",
    provider: "Hugging Face · Free",
    url: "https://huggingface.co/learn/agents-course/en/unit0/introduction",
    alternative: "LangChain & LangGraph Agentic AI",
    author: "Udemy",
    alternativeUrl: "https://www.udemy.com/course/langchain/",
    phase: "llm",
    duration: "Weeks 25–32",
    note: "Understand model APIs, tool calling and evaluations before framework abstractions.",
  },
  {
    level: 7,
    name: "Mathematics for Machine Learning",
    provider: "Imperial College London · Coursera",
    url: "https://www.coursera.org/specializations/mathematics-machine-learning",
    alternative: "Mathematical Foundations of Machine Learning",
    author: "Jon Krohn · Udemy",
    alternativeUrl:
      "https://www.udemy.com/course/machine-learning-data-science-foundations-masterclass/",
    phase: "ml",
    duration: "Weeks 33–36",
    note: "Review linear algebra, calculus, probability and statistics.",
  },
  {
    level: 8,
    name: "Machine Learning Specialization",
    provider: "Andrew Ng · Coursera",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    alternative: "Machine Learning A–Z",
    author: "Kirill Eremenko · Udemy",
    alternativeUrl: "https://www.udemy.com/course/machinelearning/",
    phase: "ml",
    duration: "Weeks 35–40",
    note: "Learn classical ML concepts and implement them with scikit-learn.",
  },
  {
    level: 9,
    name: "Practical Deep Learning for Coders",
    provider: "fast.ai · Free",
    url: "https://course.fast.ai/",
    alternative: "PyTorch for Deep Learning Bootcamp",
    author: "Daniel Bourke · Udemy",
    alternativeUrl: "https://www.udemy.com/course/pytorch-for-deep-learning/",
    phase: "production",
    duration: "Weeks 41–46",
    note: "Train, evaluate and serve a neural-network model.",
  },
  {
    level: 10,
    name: "Made With ML",
    provider: "Made With ML · Free",
    url: "https://madewithml.com/",
    alternative: "MLOps Zero to Hero",
    author: "Abhishek Veeramalla · Udemy",
    alternativeUrl: "https://www.udemy.com/course/mlops-zero-to-hero/",
    phase: "production",
    duration: "Weeks 46–50",
    note: "Production pipelines, model testing, monitoring and deployment.",
  },
];
export const projects = [
  {
    id: "finance",
    name: "Personal Finance Platform",
    tag: "Full-stack engineering",
    description:
      "Build a real financial product with authentication, transaction tracking, analytics and a PostgreSQL-backed API.",
    week: 24,
    skills: ["Python", "FastAPI", "PostgreSQL", "React", "TypeScript"],
    milestones: [
      "Design database and API schema",
      "Build auth and transaction APIs",
      "Build responsive frontend dashboard",
      "Write tests and deploy",
      "Publish technical case study",
    ],
  },
  {
    id: "research",
    name: "AI Financial Research Assistant",
    tag: "Applied AI engineering",
    description:
      "Upload financial reports, ask questions, retrieve cited evidence, calculate ratios and measure answer quality.",
    week: 32,
    skills: ["LLM APIs", "Embeddings", "RAG", "Agents", "Evals"],
    milestones: [
      "Document extraction and chunking",
      "Embedding and retrieval pipeline",
      "Grounded Q&A with citations",
      "Tool calling and user approval",
      "50 evaluation cases and deployment",
    ],
  },
  {
    id: "risk",
    name: "Intelligent Risk Analysis System",
    tag: "Machine learning",
    description:
      "Train a classifier with synthetic or public data, deploy inference and present measurable model performance.",
    week: 52,
    skills: ["NumPy", "scikit-learn", "PyTorch", "MLOps", "Docker"],
    milestones: [
      "Prepare and analyze dataset",
      "Train and compare baseline models",
      "Evaluate and document limitations",
      "Deploy inference API and frontend",
      "Monitor, test and write case study",
    ],
  },
];
export const studyDays = [
  {
    day: "Monday",
    hours: 2,
    focus: "New concepts",
    details: "Study a lecture or chapter, then rewrite examples yourself.",
  },
  {
    day: "Tuesday",
    hours: 2,
    focus: "Coding practice",
    details: "Complete exercises without generated solutions.",
  },
  {
    day: "Wednesday",
    hours: 2,
    focus: "Project build",
    details: "Implement a meaningful feature in the weekly project.",
  },
  {
    day: "Thursday",
    hours: 2,
    focus: "CS / math",
    details: "Review algorithms, data structures, SQL or relevant mathematics.",
  },
  {
    day: "Friday",
    hours: 1,
    focus: "Refactor & test",
    details: "Improve readability, write tests, document learnings.",
  },
  {
    day: "Saturday",
    hours: 5,
    focus: "Deep work",
    details: "Finish the weekly deliverable and commit it to GitHub.",
  },
  {
    day: "Sunday",
    hours: 2,
    focus: "Reflect & plan",
    details: "Rebuild from memory, review blockers and plan next week.",
  },
];
export const careerTasks = [
  {
    group: "Engineering foundation",
    items: [
      "Write and debug Python without generated solutions",
      "Build a database-backed REST API from scratch",
      "Use Git branches, commits and pull requests",
      "Understand SQL joins, transactions and indexes",
      "Deploy a complete full-stack product",
    ],
  },
  {
    group: "AI engineering",
    items: [
      "Explain model APIs, tool calling and structured outputs",
      "Implement RAG with source attribution",
      "Build an evaluation dataset and measure quality",
      "Handle prompt injection and permissions",
      "Explain model training vs fine-tuning vs RAG",
    ],
  },
  {
    group: "Portfolio and interviews",
    items: [
      "Publish three well-documented portfolio projects",
      "Create an AI engineering-focused CV",
      "Complete 30 coding interview exercises",
      "Practice three technical mock interviews",
      "Make a first open-source contribution",
      "Apply to ten targeted engineering roles",
    ],
  },
];

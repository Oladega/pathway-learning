# Pathway: AI Engineering Learning Hub

A functional, responsive personal learning operating system tailored to a 52-week transition from basic programming to AI product engineering.

## Features
- **Dashboard:** Live roadmap, course and career progress, upcoming learning queue, current week and phase-level progress charts.
- **52-week roadmap:** Six phases, weekly concepts, project deliverables, completion tracking, search, filtering and personal notes.
- **Course library:** Ten structured levels, direct primary and Udemy links, and completion tracking.
- **Project studio:** Three portfolio capstones, milestone checklists, repository links and engineering notes.
- **Study planner:** Seven-day 16-hour default schedule, actual hours logging and weekly reflections.
- **Career readiness:** Engineering, AI and portfolio/interview readiness checklists.
- **Persistence:** Automatic browser localStorage, manual JSON backup/restore and full reset.

## Run it in Codex or locally

1. Open this folder in Codex, VS Code, or your preferred terminal.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local address Vite displays (usually `http://localhost:5173`).
5. Run `npm run build` to produce an optimized `dist/` folder.

The application currently stores progress **locally in one browser**. You can export/import backups in Settings. There is no backend, user authentication, syncing between devices, or live course-provider integration. Course links open the providers' websites, and the completion controls must be updated manually.

## Project structure
- `src/data.ts`: Curriculum, courses, projects, schedule and career milestones. This is where to extend the content.
- `src/main.tsx`: App, state, persistence, dashboard, interactions and pages.
- `src/style.css`: Responsive design system and page styles.

## Further development ideas
- Add Supabase authentication and Postgres sync for access across devices.
- Add an editable task system, due dates and reminders.
- Integrate GitHub for commit-based learning activity.
- Add weekly quiz/checkpoint assessments and spaced repetition.
- Add a mobile PWA and streak tracking.
- Implement calendar sync, timeboxing and push reminders.

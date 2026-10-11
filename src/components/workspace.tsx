"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  GraduationCap,
  CalendarDays,
  FolderKanban,
  Target,
  ChartNoAxesCombined,
  Sparkles,
  Briefcase,
  NotebookPen,
  Library,
  Settings,
  Search,
  Menu,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { Provider, useStore } from "./provider";
import { mode, supabase } from "../lib/database/client";
import { weeks, courses, phases, skills } from "../data/seed";
import { notifications, roadmapProgress } from "../lib/calculations";
import { Modal, Progress } from "./ui";
import {
  Dashboard,
  Roadmap,
  Courses,
  LessonDetail,
} from "../features/learning";
import { Planner } from "../features/planner";
import { Notes, Resources } from "../features/knowledge";
import { Projects, Skills, Analytics } from "../features/growth";
import { Career, Mentor } from "../features/career";
import { Onboarding, SettingsPage } from "../features/settings";
const nav = [
  ["dashboard", "Overview", LayoutDashboard],
  ["roadmap", "My Roadmap", Map],
  ["courses", "Courses", GraduationCap],
  ["planner", "Study Planner", CalendarDays],
  ["projects", "Projects", FolderKanban],
  ["skills", "Skills", Target],
  ["analytics", "Analytics", ChartNoAxesCombined],
  ["mentor", "AI Mentor", Sparkles],
  ["career", "Career Hub", Briefcase],
  ["notes", "Notes", NotebookPen],
  ["resources", "Resources", Library],
  ["settings", "Settings", Settings],
] as const;
export function Workspace() {
  return (
    <Provider>
      <Shell />
    </Provider>
  );
}
function Shell() {
  const { state, error, clearError, notice, busy, mutate } = useStore(),
    pathname = usePathname(),
    params = useSearchParams(),
    router = useRouter();
  const route = pathname.split("/")[1] || "dashboard";
  const [drawer, setDrawer] = useState(false),
    [search, setSearch] = useState(false),
    [bells, setBells] = useState(false);
  useEffect(() => {
    if (!state.onboarded && route !== "onboarding")
      router.replace("/onboarding");
    else if (state.onboarded && (pathname === "/" || route === "onboarding"))
      router.replace("/dashboard");
  }, [state.onboarded, route, pathname, router]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const ns = notifications(state);
  const unread = ns.filter(
    (n) => state.notificationState[n.id] !== "read",
  ).length;
  const phase = weeks[state.preferences.activeWeek - 1].phase;
  let content;
  switch (route) {
    case "onboarding":
      content = <Onboarding />;
      break;
    case "dashboard":
      content = <Dashboard />;
      break;
    case "roadmap":
      content = <Roadmap selected={Number(params.get("week"))} />;
      break;
    case "courses":
      content = params.get("lesson") ? (
        <LessonDetail id={params.get("lesson")!} />
      ) : (
        <Courses level={Number(params.get("level"))} />
      );
      break;
    case "planner":
      content = <Planner />;
      break;
    case "projects":
      content = <Projects selected={params.get("id") ?? ""} />;
      break;
    case "skills":
      content = <Skills />;
      break;
    case "analytics":
      content = <Analytics />;
      break;
    case "mentor":
      content = <Mentor />;
      break;
    case "career":
      content = <Career />;
      break;
    case "notes":
      content = <Notes selected={params.get("id") ?? ""} />;
      break;
    case "resources":
      content = <Resources />;
      break;
    case "settings":
      content = <SettingsPage />;
      break;
    default:
      content = (
        <section className="panel">
          <h1>Page not found</h1>
          <Link href="/dashboard">Return to overview</Link>
        </section>
      );
  }
  if (!state.onboarded)
    return (
      <>
        <main className="onboarding">{content}</main>
        {error && (
          <div className="toast error" role="alert">
            {error}
            <button onClick={clearError}>Dismiss</button>
          </div>
        )}
      </>
    );
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      {drawer && (
        <button
          className="drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setDrawer(false)}
        />
      )}
      <aside className={drawer ? "sidebar open" : "sidebar"}>
        <Link className="brand" href="/dashboard">
          ✳{" "}
          <span>
            pathway<span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="workspace-name">
          <span className="avatar">{state.preferences.name.slice(0, 1)}</span>
          <div>
            <b>Personal workspace</b>
            <small>AI engineering journey</small>
          </div>
        </div>
        <button
          className="search-launch"
          onClick={() => {
            setSearch(true);
            setDrawer(false);
          }}
        >
          <Search size={16} /> Search anything <kbd>⌘ K</kbd>
        </button>
        <nav aria-label="Main navigation">
          {nav.map(([id, title, Icon], i) => (
            <Link
              key={id}
              href={`/${id}`}
              aria-current={route === id ? "page" : undefined}
              className={`${route === id ? "active" : ""} ${i === 9 ? "secondary" : ""}`}
              onClick={() => setDrawer(false)}
            >
              <Icon size={18} />
              {title}
            </Link>
          ))}
        </nav>
        <div className="sidebar-progress">
          <small>CURRENT PHASE</small>
          <b>{phases.find((p) => p.id === phase)?.name}</b>
          <Progress value={roadmapProgress(state)} />
          <span>{Math.round(roadmapProgress(state))}% of your journey</span>
        </div>
        <Link className="profile" href="/settings">
          <span className="avatar">{state.preferences.name.slice(0, 1)}</span>
          <span>
            <b>{state.preferences.name}</b>
            <small>
              {mode === "local" ? "Local workspace" : "Cloud account"}
            </small>
          </span>
          <Settings size={16} />
        </Link>
      </aside>
      <div className="main-shell">
        <div className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() => setDrawer(true)}
          >
            <Menu size={20} />
          </button>
          <span>{nav.find((x) => x[0] === route)?.[1] ?? "Workspace"}</span>
          <div>
            <span className="mode-label">
              {mode === "local"
                ? "Local mode · saved in this browser"
                : "Cloud · Supabase"}
            </span>
            <span className="save-status" role="status">
              {busy ? "Saving…" : "Saved"}
            </span>
            <button
              aria-label={`Notifications, ${unread} unread`}
              onClick={() => setBells(true)}
            >
              <Bell size={18} />
              {unread > 0 && <span className="notification-dot" />}
            </button>
            {mode === "cloud" && (
              <button onClick={() => void supabase().auth.signOut()}>
                Sign out
              </button>
            )}
          </div>
        </div>
        <main id="main" className="main-content">
          {content}
        </main>
        <footer>
          PATHWAY / BUILD SKILLS. SHIP PROJECTS.{" "}
          <span>Week {state.preferences.activeWeek} of 52</span>
        </footer>
      </div>
      <GlobalSearch open={search} onClose={() => setSearch(false)} />
      <Modal title="Notifications" open={bells} onClose={() => setBells(false)}>
        <p className="muted">
          In-app reminders update when you open your workspace.
        </p>
        {ns.length ? (
          ns.map((n) => (
            <div className="notification" key={n.id}>
              <Link
                href={n.href}
                onClick={() => {
                  mutate((s) => ({
                    ...s,
                    notificationState: {
                      ...s.notificationState,
                      [n.id]: "read",
                    },
                  }));
                  setBells(false);
                }}
              >
                {n.title}
                <ArrowUpRight size={15} />
              </Link>
              <small>
                {state.notificationState[n.id] === "read" ? "Read" : "Unread"}
              </small>
              <button
                onClick={() =>
                  mutate((s) => ({
                    ...s,
                    notificationState: {
                      ...s.notificationState,
                      [n.id]: "dismissed",
                    },
                  }))
                }
              >
                Dismiss
              </button>
            </div>
          ))
        ) : (
          <p>No reminders right now.</p>
        )}
      </Modal>
      {error && (
        <div className="toast error" role="alert">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}
function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state } = useStore(),
    router = useRouter(),
    [q, setQ] = useState(""),
    [index, setIndex] = useState(0);
  const all = [
    ...nav.map(([id, title]) => ({ group: "Pages", title, url: `/${id}` })),
    ...weeks.map((w) => ({
      group: "Roadmap",
      title: `Week ${w.number}: ${w.title} · ${w.topics.join(", ")}`,
      url: `/roadmap?week=${w.number}`,
    })),
    ...courses.map((c) => ({
      group: "Courses",
      title: c.name + " / " + c.alternative,
      url: `/courses?level=${c.level}`,
    })),
    ...state.lessons.map((l) => ({
      group: "Lessons",
      title: l.title,
      url: `/courses?lesson=${l.id}`,
    })),
    ...state.tasks.map((t) => ({
      group: "Tasks",
      title: t.title,
      url: `/roadmap?week=${t.week}`,
    })),
    ...state.projects.map((p) => ({
      group: "Projects",
      title: p.title,
      url: `/projects?id=${p.id}`,
    })),
    ...state.notes.map((n) => ({
      group: "Notes",
      title: n.title + " " + n.tags,
      url: `/notes?id=${n.id}`,
    })),
    ...skills.map((s) => ({ group: "Skills", title: s.name, url: "/skills" })),
  ];
  const results = all
    .filter((r) => r.title.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 40);
  return (
    <Modal title="Search your workspace" open={open} onClose={onClose}>
      <input
        aria-label="Search workspace"
        autoFocus
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setIndex(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((i) => Math.min(results.length - 1, i + 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((i) => Math.max(0, i - 1));
          }
          if (e.key === "Enter" && results[index]) {
            router.push(results[index].url);
            onClose();
          }
        }}
        placeholder="Courses, topics, tasks, projects, notes…"
      />
      <div className="search-results">
        {results.map((r, i) => (
          <button
            key={r.group + r.url + r.title}
            className={i === index ? "selected" : ""}
            onClick={() => {
              router.push(r.url);
              onClose();
            }}
          >
            <small>{r.group}</small>
            {r.title}
          </button>
        ))}
        {!results.length && <p>No matching records. Try a different phrase.</p>}
      </div>
    </Modal>
  );
}

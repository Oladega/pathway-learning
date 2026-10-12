"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createInitial } from "../data/seed";
import { parseBackup, type State } from "../lib/schema";
import {
  cloudPersistence,
  localPersistence,
  type Persistence,
} from "../lib/persistence";
import { mode, supabase } from "../lib/database/client";
import type { Session as AuthSession } from "@supabase/supabase-js";
type Context = {
  state: State;
  mutate: (fn: (s: State) => State, label?: string, href?: string) => void;
  error: string;
  clearError: () => void;
  busy: boolean;
  notice: string;
  reset: () => Promise<void>;
  importData: (s: unknown) => void;
  session: AuthSession | null;
};
const Store = createContext<Context | null>(null);
export function useStore() {
  const context = useContext(Store);
  if (!context) throw Error("Missing workspace provider");
  return context;
}
export function Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => createInitial()),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [session, setSession] = useState<AuthSession | null>(null),
    [retry, setRetry] = useState(0);
  const adapter = useRef<Persistence | null>(null),
    current = useRef(state),
    saving = useRef(false),
    loaded = useRef(false),
    queue = useRef(Promise.resolve()),
    pending = useRef(0);
  useEffect(() => {
    let live = true;
    let lastUser: string | null | undefined = undefined;
    async function init(auth: AuthSession | null) {
      const uid = auth?.user.id ?? null;
      if (lastUser === uid) {
        setSession(auth);
        return;
      }
      lastUser = uid;
      loaded.current = false;
      setReady(false);
      setSession(auth);
      try {
        if (mode === "cloud" && !auth) {
          setReady(true);
          return;
        }
        const a =
          mode === "local"
            ? localPersistence(localStorage)
            : cloudPersistence(async () => {
                const s = await supabase().auth.getSession();
                if (!s.data.session)
                  throw Error("Session expired. Please sign in again.");
                return s.data.session.access_token;
              });
        adapter.current = a;
        const existing = await a.load();
        if (live) {
          const s = existing ?? createInitial();
          current.current = s;
          setState(s);
          loaded.current = true;
          setReady(true);
          setError("");
        }
      } catch (e) {
        if (live) {
          setError(
            e instanceof Error ? e.message : "Unable to load saved data",
          );
          setReady(true);
        }
      }
    }
    if (mode === "local") void init(null);
    else {
      try {
        const c = supabase();
        void c.auth.getSession().then((r) => init(r.data.session));
        const { data } = c.auth.onAuthStateChange((_event, s) => {
          setTimeout(() => {
            if (live) void init(s);
          }, 0);
        });
        return () => {
          live = false;
          data.subscription.unsubscribe();
        };
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Invalid cloud configuration",
        );
        setReady(true);
      }
    }
    return () => {
      live = false;
    };
  }, [retry]);
  useEffect(() => {
    const theme = state.preferences.theme;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [state.preferences.theme]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);
  const mutate = useCallback(
    (fn: (s: State) => State, label?: string, href = "/dashboard") => {
      if (!loaded.current) {
        setError(
          "Data has not loaded. Resolve the storage error before making changes.",
        );
        return;
      }
      pending.current++;
      saving.current = true;
      setBusy(true);
      queue.current = queue.current.then(async () => {
        const before = current.current;
        try {
          let next = parseBackup(fn(structuredClone(before)));
          if (label)
            next = {
              ...next,
              activity: [
                {
                  id: crypto.randomUUID(),
                  title: label,
                  at: new Date().toISOString(),
                  href,
                },
                ...next.activity,
              ].slice(0, 2000),
            };
          current.current = next;
          setState(next);
          const saved = await adapter.current!.save(next);
          current.current = saved;
          setState(saved);
          setError("");
          if (label) setNotice(label);
        } catch (e) {
          current.current = before;
          setState(before);
          setError(
            e instanceof Error
              ? e.message
              : "Save failed; change was rolled back",
          );
        } finally {
          pending.current--;
          saving.current = pending.current > 0;
          setBusy(pending.current > 0);
        }
      });
    },
    [],
  );
  async function reset() {
    if (saving.current) return;
    try {
      await adapter.current!.clear();
      const s = createInitial();
      current.current = s;
      setState(s);
      loaded.current = true;
      setError("");
      setNotice("Learning data deleted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed");
    }
  }
  if (!ready)
    return (
      <div className="loading" role="status">
        Loading your learning workspace…
      </div>
    );
  if (mode === "cloud" && !session) return <Auth error={error} />;
  if (!loaded.current)
    return (
      <div className="loading">
        <h1>Saved data could not be loaded</h1>
        <p role="alert">{error}</p>
        <p>
          Your stored records have been preserved. Export or repair them before
          resetting.
        </p>
        <button onClick={() => setRetry((n) => n + 1)}>Retry</button>
        <button
          className="danger"
          onClick={() => {
            if (
              window.confirm(
                "Permanently erase the unreadable learning data? Download a backup first.",
              )
            )
              void reset();
          }}
        >
          Reset unreadable learning data
        </button>
        {mode === "local" && (
          <button
            onClick={() => {
              const blob = new Blob(
                [localStorage.getItem("pathway-v2") ?? ""],
                { type: "application/json" },
              );
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "pathway-recovery.json";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            Download raw saved data
          </button>
        )}
      </div>
    );
  return (
    <Store.Provider
      value={{
        state,
        mutate,
        error,
        clearError: () => setError(""),
        busy,
        notice,
        reset,
        importData: (input) => {
          try {
            const imported = parseBackup(input);
            mutate(
              (s) => ({ ...imported, revision: s.revision }),
              "Backup imported",
            );
          } catch {
            setError(
              "This backup is incomplete or invalid. Existing records were not changed.",
            );
          }
        },
        session,
      }}
    >
      {children}
    </Store.Provider>
  );
}
function Auth({ error: initialError }: { error: string }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [signup, setSignup] = useState(false),
    [message, setMessage] = useState(initialError),
    [pending, setPending] = useState(false);
  return (
    <main className="auth">
      <span className="brand">✳ PATHWAY</span>
      <h1>{signup ? "Create your account" : "Welcome back"}</h1>
      <p>Cloud workspace · Supabase authentication</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          try {
            const c = supabase();
            const result = signup
              ? await c.auth.signUp({ email, password })
              : await c.auth.signInWithPassword({ email, password });
            if (result.error) throw result.error;
            if (signup && !result.data.session)
              setMessage(
                "Check your email to confirm your account, then sign in.",
              );
          } catch (e) {
            setMessage(
              e instanceof Error ? e.message : "Authentication failed",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="primary" disabled={pending}>
          {pending ? "Please wait…" : signup ? "Sign up" : "Sign in"}
        </button>
      </form>
      <button onClick={() => setSignup(!signup)}>
        {signup ? "Already have an account? Sign in" : "Create account"}
      </button>
      <p role="status">{message}</p>
    </main>
  );
}

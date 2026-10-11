import { parseBackup, type State } from "./schema";
export const STORAGE_KEY = "pathway-v2";
export interface Persistence {
  load(): Promise<State | null>;
  save(state: State): Promise<State>;
  clear(): Promise<void>;
}
export function localPersistence(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
): Persistence {
  return {
    async load() {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return parseBackup(JSON.parse(raw));
    },
    async save(state) {
      const stored = storage.getItem(STORAGE_KEY);
      if (stored && parseBackup(JSON.parse(stored)).revision !== state.revision)
        throw Error("Local data changed in another tab. Reload before saving.");
      const validated = parseBackup({ ...state, revision: state.revision + 1 });
      storage.setItem(STORAGE_KEY, JSON.stringify(validated));
      return validated;
    },
    async clear() {
      storage.removeItem(STORAGE_KEY);
    },
  };
}
export function cloudPersistence(token: () => Promise<string>): Persistence {
  async function call(method: string, state?: State) {
    const response = await fetch("/api/state", {
      method,
      headers: {
        Authorization: `Bearer ${await token()}`,
        "Content-Type": "application/json",
      },
      body: state ? JSON.stringify(state) : undefined,
    });
    const result = await response.json();
    if (!response.ok) throw Error(result.error ?? "Cloud persistence failed");
    return result;
  }
  return {
    async load() {
      const data = await call("GET");
      return data.state ? parseBackup(data.state) : null;
    },
    async save(state) {
      const data = await call("PUT", state);
      return parseBackup(data.state);
    },
    async clear() {
      await call("DELETE");
    },
  };
}

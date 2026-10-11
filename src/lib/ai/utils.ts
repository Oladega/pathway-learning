import { courses } from "../../data/seed";
import type { State } from "../schema";
export function selectedTitle(state: State) {
  return courses.map((c) => ({
    level: c.level,
    title:
      state.courses[c.level]?.choice === "alternative" ? c.alternative : c.name,
  }));
}

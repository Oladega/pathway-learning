import fs from "node:fs";
const weeks = JSON.parse(
  fs.readFileSync("src/data/curriculum/weeks.json", "utf8"),
);
const courses = JSON.parse(fs.readFileSync("src/data/courses.json", "utf8"));
const skills = JSON.parse(fs.readFileSync("src/data/skills.json", "utf8"));
const phases = [
  ["python", "Python & Computer Science"],
  ["backend", "Backend Engineering"],
  ["fullstack", "Full-Stack Development"],
  ["llm", "LLM & Agent Engineering"],
  ["ml", "Mathematics & Machine Learning"],
  ["production", "Deep Learning, Production & Careers"],
];
const q = (s) => "'" + String(s).replaceAll("'", "''") + "'";
const json = (value) => q(JSON.stringify(value)) + "::jsonb";
let sql =
  "-- Curriculum and catalog only. Run after migrations. No personal achievements.\n";
for (const [i, [id, title]] of phases.entries())
  sql += `insert into public.roadmap_phases values(${q(id)},${i + 1},${q(title)},${q("Build independent capability through practical weekly work.")}) on conflict(id) do update set title=excluded.title;\n`;
for (const w of weeks)
  sql += `insert into public.roadmap_weeks values(${w.number},${q(w.phase)},${json(w)}) on conflict(number) do update set payload=excluded.payload;\n`;
for (const c of courses)
  sql += `insert into public.course_catalog values(${c.level},${json(c)}) on conflict(level) do update set payload=excluded.payload;\n`;
for (const s of skills)
  sql += `insert into public.skills values(${q(s.name)},${q(s.category)}) on conflict(name) do update set category=excluded.category;\n`;
fs.writeFileSync("supabase/seed.sql", sql);
console.log(
  `Generated seed.sql: ${weeks.length} weeks, ${phases.length} phases, ${courses.length * 2} course choices, ${skills.length} skills.`,
);

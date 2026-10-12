"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useStore } from "../components/provider";
import {
  Header,
  Field,
  Empty,
  Modal,
  str,
  uuid,
  stamp,
} from "../components/ui";
import { weeks, courses } from "../data/seed";
import type { Note } from "../lib/schema";
const templates: Record<string, string> = {
  "Concept summary":
    "## What is it?\n\n## Why does it matter?\n\n## How does it work?\n\n## Example implementation\n\n## Common mistakes\n\n## Related concepts",
  "Debugging lesson":
    "## Problem\n\n## Error message\n\n## Root cause\n\n## Solution\n\n## How to prevent it",
  "Code snippet": "```python\n# Your code here\n```",
  "Project documentation":
    "## Architecture\n\n## Technical decisions\n\n## Tests",
  "Learning reflection": "## What I learned\n\n## Challenges\n\n## Next step",
  "Interview notes": "## Question\n\n## My approach\n\n## Feedback",
};
export function Notes({ selected }: { selected: string }) {
  const { state, mutate, busy } = useStore(),
    [q, setQ] = useState(""),
    [id, setId] = useState(selected),
    [draft, setDraft] = useState<Note | null>(
      state.notes.find((n) => n.id === selected) ?? null,
    ),
    [preview, setPreview] = useState(false),
    [dirty, setDirty] = useState(false);
  function choose(note: Note) {
    if (dirty && draft)
      mutate((s) => ({
        ...s,
        notes: s.notes.map((n) =>
          n.id === draft.id ? { ...draft, updatedAt: stamp() } : n,
        ),
      }));
    setId(note.id);
    setDraft(note);
    setDirty(false);
  }
  function change(patch: Partial<Note>) {
    if (!draft) return;
    const next = { ...draft, ...patch, updatedAt: stamp() };
    setDraft(next);
    if (next.title.trim()) {
      mutate((s) => ({
        ...s,
        notes: s.notes.map((n) => (n.id === next.id ? next : n)),
      }));
      setDirty(false);
    } else setDirty(true);
  }
  return (
    <>
      <Header
        title="Notes & knowledge"
        subtitle="Turn explanations, debugging discoveries and project decisions into reusable knowledge."
        actions={
          <button
            className="primary"
            disabled={busy}
            onClick={() => {
              const n: Note = {
                id: uuid(),
                title: "Untitled note",
                body: "",
                tags: "",
                pinned: false,
                type: "Concept summary",
                week: 0,
                course: 0,
                project: "",
                updatedAt: stamp(),
              };
              mutate(
                (s) => ({ ...s, notes: [n, ...s.notes] }),
                "Note created",
                "/notes",
              );
              setId(n.id);
              setDraft(n);
              setDirty(false);
            }}
          >
            + New note
          </button>
        }
      />
      <input
        aria-label="Search notes"
        placeholder="Search notes and tags"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="notes-layout">
        <section className="panel note-list">
          {state.notes
            .filter((n) =>
              `${n.title} ${n.tags} ${n.body}`
                .toLowerCase()
                .includes(q.toLowerCase()),
            )
            .sort(
              (a, b) =>
                Number(b.pinned) - Number(a.pinned) ||
                b.updatedAt.localeCompare(a.updatedAt),
            )
            .map((n) => (
              <button
                className={id === n.id ? "selected" : ""}
                key={n.id}
                onClick={() => choose(n)}
              >
                <b>
                  {n.pinned ? "★ " : ""}
                  {n.title}
                </b>
                <small>
                  {n.tags || n.type} · {n.updatedAt.slice(0, 10)}
                </small>
              </button>
            ))}
          {!state.notes.length && (
            <Empty>Create your first concept summary or debugging note.</Empty>
          )}
        </section>
        {draft && state.notes.some((n) => n.id === draft.id) ? (
          <section className="panel">
            <Field label="Note title">
              <input
                value={draft.title}
                onChange={(e) => change({ title: e.target.value })}
              />
            </Field>
            <div className="actions">
              <select
                aria-label="Note template"
                value={draft.type}
                onChange={(e) => change({ type: e.target.value })}
              >
                {Object.keys(templates).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (
                    !draft.body ||
                    window.confirm("Replace the note body with this template?")
                  )
                    change({ body: templates[draft.type] });
                }}
              >
                Use template
              </button>
              <button onClick={() => setPreview(!preview)}>
                {preview ? "Edit Markdown" : "Preview"}
              </button>
              <button onClick={() => change({ pinned: !draft.pinned })}>
                {draft.pinned ? "Unpin" : "Pin note"}
              </button>
            </div>
            {preview ? (
              <div className="markdown">
                <ReactMarkdown>{draft.body}</ReactMarkdown>
              </div>
            ) : (
              <Field label="Markdown note">
                <textarea
                  rows={16}
                  value={draft.body}
                  onChange={(e) => change({ body: e.target.value })}
                />
              </Field>
            )}
            <div className="two-cols">
              <Field label="Tags (comma separated)">
                <input
                  value={draft.tags}
                  onChange={(e) => change({ tags: e.target.value })}
                />
              </Field>
              <Field label="Related week">
                <select
                  value={draft.week}
                  onChange={(e) => change({ week: Number(e.target.value) })}
                >
                  <option value="0">None</option>
                  {weeks.map((w) => (
                    <option value={w.number} key={w.number}>
                      Week {w.number}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Course">
                <select
                  value={draft.course}
                  onChange={(e) => change({ course: Number(e.target.value) })}
                >
                  <option value="0">None</option>
                  {courses.map((c) => (
                    <option value={c.level} key={c.level}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Project">
                <select
                  value={draft.project}
                  onChange={(e) => change({ project: e.target.value })}
                >
                  <option value="">None</option>
                  {state.projects.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="actions">
              <small role="status">
                {dirty
                  ? "Unsaved edits…"
                  : busy
                    ? "Saving…"
                    : "Saved locally or to your cloud workspace"}
              </small>
              <button
                className="danger"
                onClick={() => {
                  if (window.confirm("Delete this note?")) {
                    mutate(
                      (s) => ({
                        ...s,
                        notes: s.notes.filter((n) => n.id !== draft.id),
                      }),
                      "Note deleted",
                    );
                    setDraft(null);
                    setDirty(false);
                  }
                }}
              >
                Delete note
              </button>
            </div>
          </section>
        ) : (
          <section className="panel">
            <Empty>Select a note to edit or preview.</Empty>
          </section>
        )}
      </div>
    </>
  );
}
export function Resources() {
  const { state, mutate } = useStore(),
    [q, setQ] = useState(""),
    [adding, setAdding] = useState(false);
  return (
    <>
      <Header
        title="Resource library"
        subtitle="Documentation and reading mapped to your learning journey."
        actions={
          <button className="primary" onClick={() => setAdding(true)}>
            + Add resource
          </button>
        }
      />
      <input
        aria-label="Search resources"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search documentation"
      />
      <div className="course-grid">
        {state.resources
          .filter((r) =>
            `${r.title} ${r.category}`.toLowerCase().includes(q.toLowerCase()),
          )
          .map((r) => (
            <section className="panel" key={r.id}>
              <span className="eyebrow">{r.category}</span>
              <h2>{r.title}</h2>
              <a href={r.url} target="_blank" rel="noreferrer">
                Open documentation ↗
              </a>
              <Field label="Reading notes">
                <textarea
                  defaultValue={r.notes}
                  onBlur={(e) => {
                    const eventValue = e.target.value;
                    if (eventValue !== r.notes)
                      mutate(
                        (s) => ({
                          ...s,
                          resources: s.resources.map((x) =>
                            x.id === r.id ? { ...x, notes: eventValue } : x,
                          ),
                        }),
                        "Resource note saved",
                      );
                  }}
                />
              </Field>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={r.done}
                  onChange={(e) => {
                    const eventChecked = e.target.checked;
                    mutate(
                      (s) => ({
                        ...s,
                        resources: s.resources.map((x) =>
                          x.id === r.id ? { ...x, done: eventChecked } : x,
                        ),
                      }),
                      "Reading status updated",
                    );
                  }}
                />
                Reviewed
              </label>
              <button
                className="danger"
                onClick={() => {
                  if (window.confirm("Remove this resource?"))
                    mutate(
                      (s) => ({
                        ...s,
                        resources: s.resources.filter((x) => x.id !== r.id),
                      }),
                      "Resource removed",
                    );
                }}
              >
                Remove
              </button>
            </section>
          ))}
      </div>
      <Modal
        title="Add resource"
        open={adding}
        onClose={() => setAdding(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mutate(
              (s) => ({
                ...s,
                resources: [
                  ...s.resources,
                  {
                    id: uuid(),
                    title: str(f, "title"),
                    url: str(f, "url"),
                    category: str(f, "category"),
                    notes: "",
                    done: false,
                  },
                ],
              }),
              "Resource added",
            );
            setAdding(false);
          }}
        >
          <Field label="Title">
            <input name="title" required />
          </Field>
          <Field label="URL">
            <input type="url" name="url" required />
          </Field>
          <Field label="Category">
            <input name="category" defaultValue="Documentation" />
          </Field>
          <button className="primary">Save resource</button>
        </form>
      </Modal>
    </>
  );
}

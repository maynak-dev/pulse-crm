import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Trash2, Plus, CheckCircle2, Circle, ListTodo } from "lucide-react";

type Filter = "all" | "open" | "done";

export default function Tasks() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.get("/api/tasks").then((r) => r.data),
  });
  const create = useMutation({
    mutationFn: () => api.post("/api/tasks", { title }),
    onSuccess: () => { setTitle(""); qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });
  const toggle = useMutation({
    mutationFn: (t: any) => api.patch(`/api/tasks/${t.id}`, { done: !t.done }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function submit(e: FormEvent) { e.preventDefault(); if (title.trim()) create.mutate(); }

  const filtered = useMemo(() => {
    if (filter === "open") return tasks.filter((t: any) => !t.done);
    if (filter === "done") return tasks.filter((t: any) => t.done);
    return tasks;
  }, [tasks, filter]);

  const openCount = tasks.filter((t: any) => !t.done).length;
  const doneCount = tasks.length - openCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">{openCount} open · {doneCount} done · Stay on top of what matters.</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <ListTodo className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Add a task… (press Enter)" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <button className="btn" disabled={!title.trim() || create.isPending}>
          <Plus className="h-4 w-4" /> Add task
        </button>
      </form>

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
        {(["all", "open", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition ${
              filter === f ? "bg-brand-gradient text-white shadow-glow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-slate-100 p-0">
        {isLoading && <div className="p-8 text-center text-slate-400">Loading…</div>}
        {!isLoading && filtered.map((t: any) => (
          <div key={t.id} className="group flex items-center gap-3 p-4 transition hover:bg-slate-50/60">
            <button
              onClick={() => toggle.mutate(t)}
              className="flex-shrink-0 transition hover:scale-110"
              aria-label={t.done ? "Mark as not done" : "Mark as done"}
            >
              {t.done
                ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                : <Circle className="h-5 w-5 text-slate-300 group-hover:text-brand-500" />}
            </button>
            <div className={`flex-1 text-sm transition ${t.done ? "text-slate-400 line-through" : "text-slate-800 font-medium"}`}>
              {t.title}
            </div>
            <button
              onClick={() => del.mutate(t.id)}
              className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="mt-3 font-semibold text-slate-700">All caught up!</div>
            <p className="mt-1 text-sm text-slate-500">No tasks here. Add one above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

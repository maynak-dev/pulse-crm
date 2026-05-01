import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Trash2 } from "lucide-react";

export default function Tasks() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const { data: tasks = [] } = useQuery({
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

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Tasks</h1>
      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input className="input" placeholder="Add a task…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn">Add</button>
      </form>
      <div className="card divide-y p-0">
        {tasks.map((t: any) => (
          <div key={t.id} className="flex items-center gap-3 p-3">
            <input type="checkbox" checked={t.done} onChange={() => toggle.mutate(t)} />
            <div className={`flex-1 text-sm ${t.done ? "text-slate-400 line-through" : ""}`}>{t.title}</div>
            <button onClick={() => del.mutate(t.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {tasks.length === 0 && <div className="p-6 text-center text-slate-400">No tasks</div>}
      </div>
    </div>
  );
}

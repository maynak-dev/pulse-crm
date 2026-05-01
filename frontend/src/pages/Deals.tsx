import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Plus } from "lucide-react";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];

export default function Deals() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: () => api.get("/api/deals").then((r) => r.data),
  });
  const moveStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.patch(`/api/deals/${id}/stage`, { stage }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <button className="btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New deal</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((stage) => {
          const items = deals.filter((d: any) => d.stage === stage);
          const total = items.reduce((s: number, d: any) => s + d.value, 0);
          return (
            <div
              key={stage}
              className="rounded-lg bg-slate-100 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("id");
                if (id) moveStage.mutate({ id, stage });
              }}
            >
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase text-slate-600">
                <span>{stage}</span><span>${total.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {items.map((d: any) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("id", d.id)}
                    className="cursor-move rounded-md bg-white p-3 shadow-sm"
                  >
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-slate-500">${d.value.toLocaleString()}</div>
                    {d.company && <div className="mt-1 text-xs text-slate-400">{d.company.name}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {open && <DealDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function DealDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", value: 0, stage: "lead" });
  const create = useMutation({
    mutationFn: () => api.post("/api/deals", { ...form, value: Number(form.value) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); onClose(); },
  });
  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-3">
        <h2 className="text-lg font-bold">New deal</h2>
        <input className="input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn">Save</button>
        </div>
      </form>
    </div>
  );
}

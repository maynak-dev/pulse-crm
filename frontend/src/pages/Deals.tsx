import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Plus } from "lucide-react";
import { Modal } from "./Contacts";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const STAGE_DOT: Record<string, string> = {
  lead: "bg-slate-400",
  qualified: "bg-sky-500",
  proposal: "bg-violet-500",
  negotiation: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-rose-500",
};
const STAGE_BORDER: Record<string, string> = {
  lead: "border-l-slate-400",
  qualified: "border-l-sky-500",
  proposal: "border-l-violet-500",
  negotiation: "border-l-amber-500",
  won: "border-l-emerald-500",
  lost: "border-l-rose-500",
};

export default function Deals() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: () => api.get("/api/deals").then((r) => r.data),
  });
  const moveStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.patch(`/api/deals/${id}/stage`, { stage }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });

  const totalPipeline = deals.reduce((s: number, d: any) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            {deals.length} deals · ${totalPipeline.toLocaleString()} total · Drag cards to change stage.
          </p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New deal</button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => {
          const items = deals.filter((d: any) => d.stage === stage);
          const total = items.reduce((s: number, d: any) => s + d.value, 0);
          const isOver = dragOver === stage;
          return (
            <div
              key={stage}
              className={`stage-col transition-all ${isOver ? "bg-brand-50/70 ring-2 ring-brand-300" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                setDragOver(null);
                const id = e.dataTransfer.getData("id");
                if (id) moveStage.mutate({ id, stage });
              }}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`stage-dot ${STAGE_DOT[stage]}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{stage}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{items.length}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">${total.toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                {items.map((d: any) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("id", d.id)}
                    className={`group cursor-grab rounded-xl border border-slate-200/70 bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card active:cursor-grabbing border-l-4 ${STAGE_BORDER[stage]}`}
                  >
                    <div className="text-sm font-semibold text-slate-900">{d.title}</div>
                    <div className="mt-1 font-display text-base font-extrabold text-brand-700">${d.value.toLocaleString()}</div>
                    {d.company && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                          {d.company.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-xs text-slate-500">{d.company.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                    Drop here
                  </div>
                )}
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
    mutationFn: () => api.post("/api/deals", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); onClose(); },
  });
  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }
  return (
    <Modal onClose={onClose} title="New deal">
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Deal title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
          <input className="input pl-7" type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        </div>
        <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save deal"}</button>
        </div>
      </form>
    </Modal>
  );
}

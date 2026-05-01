import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Plus, Trash2 } from "lucide-react";

export default function Companies() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get("/api/companies").then((r) => r.data),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/api/companies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Companies</h1>
        <button className="btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((c: any) => (
          <div key={c.id} className="card flex items-start justify-between">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-slate-500">{c.industry || "—"} · {c.domain || "—"}</div>
              <div className="mt-2 flex gap-2 text-xs text-slate-500">
                <span className="badge">{c._count.contacts} contacts</span>
                <span className="badge">{c._count.deals} deals</span>
              </div>
            </div>
            <button onClick={() => del.mutate(c.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {companies.length === 0 && <div className="text-slate-400">No companies yet</div>}
      </div>
      {open && <CompanyDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function CompanyDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", domain: "", industry: "" });
  const create = useMutation({
    mutationFn: () => api.post("/api/companies", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); onClose(); },
  });
  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-3">
        <h2 className="text-lg font-bold">New company</h2>
        <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
        <input className="input" placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn">Save</button>
        </div>
      </form>
    </div>
  );
}

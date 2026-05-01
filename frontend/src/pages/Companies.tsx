import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Plus, Trash2, Building2, Globe } from "lucide-react";
import { Modal } from "./Contacts";

function companyInitials(name: string) {
  return name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "?";
}

export default function Companies() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get("/api/companies").then((r) => r.data),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/api/companies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">{companies.length} total · Track the businesses you work with.</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New company</button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="mt-3 font-semibold text-slate-700">No companies yet</div>
          <p className="mt-1 max-w-xs text-sm text-slate-500">Add your first company to start tracking deals and contacts.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c: any) => (
            <div key={c.id} className="card card-hover group flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-soft">
                  {companyInitials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-slate-900">{c.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
                    {c.domain && <Globe className="h-3 w-3 flex-shrink-0" />}
                    <span className="truncate">{c.industry || "—"}{c.domain ? ` · ${c.domain}` : ""}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="badge">{c._count.contacts} contacts</span>
                    <span className="badge badge-brand">{c._count.deals} deals</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => del.mutate(c.id)}
                className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                aria-label="Delete company"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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
    <Modal onClose={onClose} title="New company">
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Company name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Domain (e.g. acme.com)" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
        <input className="input" placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save company"}</button>
        </div>
      </form>
    </Modal>
  );
}

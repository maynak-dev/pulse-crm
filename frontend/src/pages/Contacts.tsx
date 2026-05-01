import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Trash2, Plus, Search, X, Mail, Phone, Briefcase as TitleIcon } from "lucide-react";

function avatarInitials(a?: string, b?: string) {
  return `${(a ?? "").charAt(0)}${(b ?? "").charAt(0)}`.toUpperCase() || "??";
}

export default function Contacts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", search],
    queryFn: () => api.get("/api/contacts", { params: { search } }).then((r) => r.data),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/api/contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500">{contacts.length} total · Manage the people you work with.</p>
        </div>
        <button className="btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New contact</button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search by name, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Title</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!isLoading && contacts.map((c: any) => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">{avatarInitials(c.firstName, c.lastName)}</div>
                    <div className="font-semibold text-slate-900">{c.firstName} {c.lastName}</div>
                  </div>
                </td>
                <td className="text-slate-600">{c.email || "—"}</td>
                <td>{c.company?.name ? <span className="badge badge-brand">{c.company.name}</span> : <span className="text-slate-400">—</span>}</td>
                <td className="text-slate-600">{c.title || "—"}</td>
                <td className="text-right">
                  <button
                    onClick={() => del.mutate(c.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete contact"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && contacts.length === 0 && (
              <tr><td colSpan={5} className="p-12 text-center">
                <div className="mx-auto max-w-xs">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-semibold text-slate-700">No contacts yet</div>
                  <p className="mt-1 text-sm text-slate-500">Add your first contact to get started.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && <ContactDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function ContactDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", title: "" });
  const create = useMutation({
    mutationFn: () => api.post("/api/contacts", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); onClose(); },
  });
  function submit(e: FormEvent) { e.preventDefault(); create.mutate(); }
  return (
    <Modal onClose={onClose} title="New contact">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="First name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input className="input" placeholder="Last name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="relative">
          <TitleIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save contact"}</button>
        </div>
      </form>
    </Modal>
  );
}

export function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md animate-pop-in rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Trash2, Plus } from "lucide-react";

export default function Contacts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", search],
    queryFn: () => api.get("/api/contacts", { params: { search } }).then((r) => r.data),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/api/contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button className="btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New</button>
      </div>
      <input className="input mb-4 max-w-sm" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="p-3">Name</th><th>Email</th><th>Company</th><th>Title</th><th></th></tr>
          </thead>
          <tbody>
            {contacts.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.firstName} {c.lastName}</td>
                <td>{c.email}</td>
                <td>{c.company?.name || "—"}</td>
                <td>{c.title || "—"}</td>
                <td className="pr-3 text-right">
                  <button onClick={() => del.mutate(c.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No contacts yet</td></tr>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="card w-full max-w-md space-y-3">
        <h2 className="text-lg font-bold">New contact</h2>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="First name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input className="input" placeholder="Last name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn">Save</button>
        </div>
      </form>
    </div>
  );
}

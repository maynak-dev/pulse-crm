import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

export default function Register() {
  const nav = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/api/auth/register", form);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      nav("/");
    } catch (e: any) {
      const error = e.response?.data?.error;
      if (typeof error === "object" && error !== null) {
        // Zod flatten() returns { formErrors: string[], fieldErrors: Record<string, string[]> }
        const fieldMsgs = Object.values(error.fieldErrors ?? {}).flat().join(", ");
        const formMsgs = (error.formErrors ?? []).join(", ");
        setErr(fieldMsgs || formMsgs || "Registration failed");
      } else {
        setErr(error || "Registration failed");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Create your account</h1>
        {err && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</div>}
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn w-full justify-center">Create account</button>
        <p className="text-center text-sm text-slate-500">Have an account? <Link to="/login" className="underline">Sign in</Link></p>
      </form>
    </div>
  );
}

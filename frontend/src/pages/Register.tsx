import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

export default function Register() {
  const nav = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", form);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      nav("/");
    } catch (e: any) {
      const error = e.response?.data?.error;
      if (typeof error === "object" && error !== null) {
        const fieldMsgs = Object.values(error.fieldErrors ?? {}).flat().join(", ");
        const formMsgs = (error.formErrors ?? []).join(", ");
        setErr(fieldMsgs || formMsgs || "Registration failed");
      } else {
        setErr(error || "Registration failed");
      }
    } finally { setLoading(false); }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-brand-50" />
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="font-display text-xl font-extrabold tracking-tight">Pulse CRM</div>
        </div>

        <div className="glass-card animate-pop-in">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Start organizing your pipeline in minutes.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {err && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Name</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9 pr-10" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button className="btn w-full" disabled={loading}>
              {loading ? "Creating…" : (<>Create account <ArrowRight className="h-4 w-4" /></>)}
            </button>

            <p className="pt-2 text-center text-sm text-slate-500">
              Have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

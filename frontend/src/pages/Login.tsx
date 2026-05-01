import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

export default function Login() {
  const nav = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const [email, setEmail] = useState("demo@crm.dev");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      nav("/");
    } catch (e: any) {
      const error = e.response?.data?.error;
      if (typeof error === "object" && error !== null) {
        const fieldMsgs = Object.values(error.fieldErrors ?? {}).flat().join(", ");
        const formMsgs = (error.formErrors ?? []).join(", ");
        setErr(fieldMsgs || formMsgs || "Login failed");
      } else {
        setErr(error || "Login failed");
      }
    } finally { setLoading(false); }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-brand-50" />
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-[0_40px_120px_-40px_rgba(34,45,170,.45)] backdrop-blur-xl md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-brand-gradient p-10 text-white md:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="font-display text-xl font-extrabold tracking-tight">Pulse CRM</div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold leading-tight">
              Close more deals,<br />beautifully.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/80">
              Your contacts, pipeline, and tasks — all in one calm, focused workspace.
            </p>
          </div>
          <div className="text-xs text-white/70">© {new Date().getFullYear()} Pulse</div>
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -top-16 -left-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Form */}
        <div className="p-8 md:p-12">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {err && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9 pr-10" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
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
              {loading ? "Signing in…" : (<>Sign in <ArrowRight className="h-4 w-4" /></>)}
            </button>

            <p className="pt-2 text-center text-sm text-slate-500">
              No account? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

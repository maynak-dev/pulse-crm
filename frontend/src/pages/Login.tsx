import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";

export default function Login() {
  const nav = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const [email, setEmail] = useState("demo@crm.dev");
  const [password, setPassword] = useState("demo1234");
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
      setErr(e.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Sign in to CRM</h1>
        {err && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</div>}
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-full justify-center" disabled={loading}>{loading ? "..." : "Sign in"}</button>
        <p className="text-center text-sm text-slate-500">No account? <Link to="/register" className="underline">Register</Link></p>
      </form>
    </div>
  );
}

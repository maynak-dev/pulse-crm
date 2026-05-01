import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Building2, Briefcase, CheckSquare, LogOut, Sparkles, Search, Bell } from "lucide-react";
import { useAuth } from "../store/auth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/deals", label: "Deals", icon: Briefcase },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
];

function initials(email?: string) {
  if (!email) return "U";
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-slate-200/70 bg-white/80 px-4 py-6 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none tracking-tight">Pulse</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">CRM</div>
          </div>
        </div>

        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <Icon className="h-4.5 w-4.5" /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-soft">
            <div className="avatar">{initials(user?.email)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-800">{user?.name || "Account"}</div>
              <div className="truncate text-xs text-slate-500">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="btn-ghost w-full justify-start">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-8 py-3.5">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Quick search…" />
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-outline" aria-label="Notifications"><Bell className="h-4 w-4" /></button>
              <div className="avatar">{initials(user?.email)}</div>
            </div>
          </div>
        </header>
        <div className="page-enter px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

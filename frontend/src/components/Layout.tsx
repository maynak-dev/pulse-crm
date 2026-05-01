import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Building2, Briefcase, CheckSquare, LogOut } from "lucide-react";
import { useAuth } from "../store/auth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/deals", label: "Deals", icon: Briefcase },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-slate-200 bg-white p-4">
        <div className="mb-6 px-2 text-lg font-bold">CRM</div>
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <div className="mb-2 px-3 text-xs text-slate-500">{user?.email}</div>
          <button onClick={logout} className="btn-ghost w-full justify-start">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

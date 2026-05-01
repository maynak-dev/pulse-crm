import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Briefcase, CheckSquare, TrendingUp, Trophy } from "lucide-react";
import { api } from "../lib/api";

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-slate-400",
  qualified: "bg-sky-500",
  proposal: "bg-violet-500",
  negotiation: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-rose-500",
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-28 animate-pulse">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="mt-4 h-7 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Contacts", value: data.contacts, icon: Users, tone: "text-sky-600 bg-sky-50" },
    { label: "Companies", value: data.companies, icon: Building2, tone: "text-violet-600 bg-violet-50" },
    { label: "Open deals", value: data.deals, icon: Briefcase, tone: "text-brand-600 bg-brand-50" },
    { label: "Open tasks", value: data.tasksOpen, icon: CheckSquare, tone: "text-amber-600 bg-amber-50" },
    { label: "Pipeline value", value: `$${data.pipelineValue.toLocaleString()}`, icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Won revenue", value: `$${data.wonRevenue.toLocaleString()}`, icon: Trophy, tone: "text-rose-600 bg-rose-50" },
  ];

  const stageEntries = Object.entries(data.byStage as Record<string, number>);
  const stageTotal = stageEntries.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">A quick pulse on your business today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-tile">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
                  <div className="mt-2 font-display text-3xl font-extrabold tracking-tight">{s.value}</div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Deals by stage</h2>
            <p className="text-sm text-slate-500">Distribution across your pipeline</p>
          </div>
        </div>

        <div className="mb-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
          {stageEntries.map(([k, v]) => (
            <div
              key={k}
              className={`${STAGE_COLORS[k] ?? "bg-slate-400"} transition-all`}
              style={{ width: `${(v / stageTotal) * 100}%` }}
              title={`${k}: ${v}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {stageEntries.map(([k, v]) => (
            <span key={k} className="badge">
              <span className={`stage-dot ${STAGE_COLORS[k] ?? "bg-slate-400"}`} />
              <span className="capitalize">{k}</span>
              <span className="text-slate-400">·</span>
              <span className="font-semibold text-slate-700">{v}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

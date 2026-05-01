import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
  });
  if (!data) return <div>Loading…</div>;
  const stats = [
    { label: "Contacts", value: data.contacts },
    { label: "Companies", value: data.companies },
    { label: "Open deals", value: data.deals },
    { label: "Open tasks", value: data.tasksOpen },
    { label: "Pipeline value", value: `$${data.pipelineValue.toLocaleString()}` },
    { label: "Won revenue", value: `$${data.wonRevenue.toLocaleString()}` },
  ];
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="card mt-6">
        <h2 className="mb-3 font-semibold">Deals by stage</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.byStage as Record<string, number>).map(([k, v]) => (
            <span key={k} className="badge">{k}: {v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

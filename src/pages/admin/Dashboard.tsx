import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Stats } from "@/lib/api";
import type { Company } from "@shared/types";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Company[]>([]);

  useEffect(() => {
    api.stats().then(setStats);
    api.companies().then((r) => setRecent(r.items.slice(0, 5)));
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold fx-text">Dashboard</h1>
      <p className="mt-1 text-sm fx-muted">Overview of the Lyceum portfolio.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sectors", value: stats?.sectors ?? "—", to: "/admin/sectors" },
          { label: "Companies", value: stats?.companies ?? "—", to: "/admin/companies" },
          { label: "Countries", value: stats?.countries ?? "—", to: "/portal" },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="fx-card p-6">
            <p className="font-mono text-xs uppercase tracking-wide fx-muted">{s.label}</p>
            <p className="mt-2 fx-headline font-display text-4xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/companies/new" className="fx-btn">+ Add company</Link>
        <Link to="/admin/sectors" className="fx-btn-ghost">Manage sectors</Link>
      </div>

      <div className="fx-glass mt-8 p-6">
        <h2 className="font-display text-lg font-semibold fx-text">Companies</h2>
        <ul className="mt-3 divide-y" style={{ borderColor: "var(--surface-border)" }}>
          {recent.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3" style={{ borderColor: "var(--surface-border)" }}>
              <div>
                <p className="text-sm font-medium fx-text">{c.name}</p>
                <p className="font-mono text-xs fx-muted">{c.sector_name}</p>
              </div>
              <Link to={`/admin/companies/${c.id}`} className="text-sm font-medium fx-link-accent fx-text">Edit →</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { Company } from "@shared/types";
import { Spinner } from "@/components/States";
import { StatusBadge } from "@/components/StatusBadge";

export default function CompaniesAdmin() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = () =>
    api.companies(q ? { q } : {}).then((r) => setCompanies(r.items)).finally(() => setLoading(false));

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const remove = async (c: Company) => {
    if (!confirm(`Delete “${c.name}”? This cannot be undone.`)) return;
    await api.deleteCompany(c.id);
    await load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold fx-text">Companies</h1>
          <p className="mt-1 text-sm fx-muted">{companies.length} companies in the portfolio.</p>
        </div>
        <Link to="/admin/companies/new" className="fx-btn">+ New company</Link>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search companies…"
        className="fx-field mt-5 max-w-sm"
      />

      {loading ? (
        <Spinner />
      ) : (
        <div className="fx-glass mt-5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b fx-border text-left font-mono text-xs uppercase tracking-wide fx-muted">
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Sector</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b fx-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium fx-text">{c.name} {c.featured ? <span title="Featured">⭐</span> : null}</p>
                    <p className="font-mono text-xs fx-muted">{c.headquarters}</p>
                  </td>
                  <td className="px-5 py-3 fx-muted">{c.sector_name}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Link to={`/portal/${c.sector_slug}/${c.slug}`} className="mr-3 font-medium fx-link">View</Link>
                    <Link to={`/admin/companies/${c.id}`} className="mr-3 font-medium fx-link-accent fx-text">Edit</Link>
                    <button onClick={() => remove(c)} className="font-medium" style={{ color: "#f87171" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

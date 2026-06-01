import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Sector } from "@shared/types";
import { Spinner } from "@/components/States";

const BLANK: Partial<Sector> = {
  name: "", tagline: "", description: "", icon: "🏛️", accent: "#2563eb",
};

export default function SectorsAdmin() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Sector> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.sectors().then(setSectors).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      if (editing.id) await api.updateSector(editing.id, editing);
      else await api.createSector(editing);
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s: Sector) => {
    if (!confirm(`Delete sector “${s.name}”? This is only possible if it has no companies.`)) return;
    try {
      await api.deleteSector(s.id);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold fx-text">Sectors</h1>
          <p className="mt-1 text-sm fx-muted">Create and edit portfolio sectors.</p>
        </div>
        <button onClick={() => setEditing({ ...BLANK })} className="fx-btn">+ New sector</button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="fx-glass mt-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b fx-border text-left font-mono text-xs uppercase tracking-wide fx-muted">
                <th className="px-5 py-3">Sector</th>
                <th className="px-5 py-3">Companies</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((s) => (
                <tr key={s.id} className="border-b fx-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg text-lg" style={{ background: `${s.accent}22` }}>{s.icon}</span>
                      <div>
                        <p className="font-medium fx-text">{s.name}</p>
                        <p className="text-xs fx-muted">{s.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 fx-muted">{s.company_count ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setEditing(s)} className="mr-3 font-medium fx-link-accent fx-text">Edit</button>
                    <button onClick={() => remove(s)} className="font-medium" style={{ color: "#f87171" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="fx-surface w-full max-w-lg p-6 shadow-2xl" style={{ background: "var(--surface-solid)" }}>
            <h2 className="font-display text-xl font-semibold fx-text">{editing.id ? "Edit sector" : "New sector"}</h2>
            {error && <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "color-mix(in srgb, #ef4444 14%, transparent)", color: "#fca5a5" }}>{error}</div>}
            <div className="mt-4 space-y-4">
              <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} required />
              <Field label="Tagline" value={editing.tagline ?? ""} onChange={(v) => setEditing({ ...editing, tagline: v })} />
              <div>
                <label className="block text-sm font-medium fx-text">Description</label>
                <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="fx-field mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Icon (emoji)" value={editing.icon ?? ""} onChange={(v) => setEditing({ ...editing, icon: v })} />
                <div>
                  <label className="block text-sm font-medium fx-text">Accent colour</label>
                  <input type="color" value={editing.accent ?? "#2563eb"} onChange={(e) => setEditing({ ...editing, accent: e.target.value })} className="mt-1 h-10 w-full rounded-lg border fx-border" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="fx-btn-ghost">Cancel</button>
              <button type="submit" disabled={busy} className="fx-btn disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, required,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium fx-text">{label}</label>
      <input value={value} required={required} onChange={(e) => onChange(e.target.value)} className="fx-field mt-1" />
    </div>
  );
}

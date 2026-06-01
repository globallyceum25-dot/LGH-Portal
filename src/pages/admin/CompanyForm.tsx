import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { Application, Company, CompanyStatus, Sector } from "@shared/types";
import { Spinner } from "@/components/States";
import { AppThumbnail } from "@/components/AppThumbnail";
import { STATUS_OPTIONS, STATUS_META } from "@/lib/format";

type Form = Partial<Company> & { productsText?: string };

const BLANK: Form = {
  name: "", slug: "", tagline: "", overview: "", mission: "", legal_name: "",
  headquarters: "", country: "", employees: "", revenue: "", website: "",
  email: "", phone: "", ceo: "", status: "active", featured: false,
  productsText: "", founded_year: null,
};

export default function CompanyForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [form, setForm] = useState<Form>(BLANK);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.sectors().then((s) => {
      setSectors(s);
      setForm((f) => (f.sector_id ? f : { ...f, sector_id: s[0]?.id }));
    });
  }, []);

  useEffect(() => {
    if (isNew) return;
    api.companies().then(async (r) => {
      const found = r.items.find((c) => c.id === Number(id));
      if (found) {
        const full = await api.company(found.slug);
        setForm({ ...full, productsText: full.products.join("\n") });
        setApps(full.applications ?? []);
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload: Partial<Company> = {
      ...form,
      products: (form.productsText ?? "").split("\n").map((p) => p.trim()).filter(Boolean),
      founded_year: form.founded_year ? Number(form.founded_year) : null,
      sector_id: Number(form.sector_id),
    };
    try {
      if (isNew) {
        const created = await api.createCompany(payload);
        navigate(`/admin/companies/${created.id}`);
      } else {
        await api.updateCompany(Number(id), payload);
        navigate("/admin/companies");
      }
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-8">
      <nav className="mb-4 font-mono text-xs fx-muted">
        <Link to="/admin/companies" className="fx-link">COMPANIES</Link>
        <span className="mx-2">/</span>
        <span className="fx-accent">{isNew ? "NEW" : form.name?.toUpperCase()}</span>
      </nav>
      <h1 className="font-display text-2xl font-semibold fx-text">{isNew ? "Add company" : `Edit ${form.name}`}</h1>

      {error && <div className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "color-mix(in srgb, #ef4444 14%, transparent)", color: "#fca5a5" }}>{error}</div>}

      <form onSubmit={submit} className="mt-6 max-w-3xl space-y-8">
        <Card title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name *" value={form.name ?? ""} onChange={(v) => set({ name: v })} required />
            <Input label="Slug (optional)" value={form.slug ?? ""} onChange={(v) => set({ slug: v })} placeholder="auto-generated" />
            <Input label="Legal name" value={form.legal_name ?? ""} onChange={(v) => set({ legal_name: v })} />
            <div>
              <label className="block text-sm font-medium fx-text">Sector *</label>
              <select value={form.sector_id ?? ""} onChange={(e) => set({ sector_id: Number(e.target.value) })} required className="fx-field mt-1">
                {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Input label="Tagline" value={form.tagline ?? ""} onChange={(v) => set({ tagline: v })} />
          </div>
        </Card>

        <Card title="Business profile">
          <Textarea label="Overview" value={form.overview ?? ""} onChange={(v) => set({ overview: v })} rows={6} />
          <div className="mt-4"><Textarea label="Mission statement" value={form.mission ?? ""} onChange={(v) => set({ mission: v })} rows={2} /></div>
          <div className="mt-4"><Textarea label="Products & services (one per line)" value={form.productsText ?? ""} onChange={(v) => set({ productsText: v })} rows={4} /></div>
        </Card>

        <Card title="Facts & figures">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Chief Executive" value={form.ceo ?? ""} onChange={(v) => set({ ceo: v })} />
            <Input label="Founded year" type="number" value={String(form.founded_year ?? "")} onChange={(v) => set({ founded_year: v ? Number(v) : null })} />
            <Input label="Headquarters" value={form.headquarters ?? ""} onChange={(v) => set({ headquarters: v })} />
            <Input label="Country" value={form.country ?? ""} onChange={(v) => set({ country: v })} />
            <Input label="Employees" value={form.employees ?? ""} onChange={(v) => set({ employees: v })} placeholder="e.g. 500–1,000" />
            <Input label="Revenue" value={form.revenue ?? ""} onChange={(v) => set({ revenue: v })} placeholder="e.g. $250M+" />
          </div>
        </Card>

        <Card title="Contact & status">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Website" value={form.website ?? ""} onChange={(v) => set({ website: v })} />
            <Input label="Email" type="email" value={form.email ?? ""} onChange={(v) => set({ email: v })} />
            <Input label="Phone" value={form.phone ?? ""} onChange={(v) => set({ phone: v })} />
            <div>
              <label className="block text-sm font-medium fx-text">Status</label>
              <select value={form.status ?? "active"} onChange={(e) => set({ status: e.target.value as CompanyStatus })} className="fx-field mt-1">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm fx-text">
            <input type="checkbox" checked={!!form.featured} onChange={(e) => set({ featured: e.target.checked })} className="h-4 w-4 rounded" />
            Feature this company
          </label>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/admin/companies" className="fx-btn-ghost">Cancel</Link>
          <button type="submit" disabled={busy} className="fx-btn disabled:opacity-60">
            {busy ? "Saving…" : isNew ? "Create company" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Applications manager — only once the company exists */}
      <div className="mt-10 max-w-3xl">
        {isNew ? (
          <div className="fx-glass p-6 text-sm fx-muted">
            💡 Save the company first, then you can connect its applications by URL.
          </div>
        ) : (
          <ApplicationsManager companyId={Number(id)} apps={apps} setApps={setApps} />
        )}
      </div>
    </div>
  );
}

function ApplicationsManager({
  companyId, apps, setApps,
}: { companyId: number; apps: Application[]; setApps: (a: Application[]) => void }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    const items = await api
      .company((await api.companies()).items.find((c) => c.id === companyId)!.slug)
      .then((c) => c.applications ?? []);
    setApps(items);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api.createApplication({ company_id: companyId, url, name, category });
      setUrl(""); setName(""); setCategory("");
      await reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a: Application) => {
    if (!confirm(`Disconnect “${a.name}”?`)) return;
    await api.deleteApplication(a.id);
    setApps(apps.filter((x) => x.id !== a.id));
  };

  return (
    <section className="fx-surface p-6" style={{ background: "var(--surface-solid)" }}>
      <h2 className="font-display text-lg font-semibold fx-text">Connected applications</h2>
      <p className="mt-1 text-sm fx-muted">Connect the apps this company uses by URL. A thumbnail is generated automatically.</p>

      <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="App URL (e.g. figma.com)" className="fx-field" required aria-label="Application URL" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className="fx-field" aria-label="Application name" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="fx-field sm:w-32" aria-label="Category" />
        <button type="submit" disabled={busy} className="fx-btn disabled:opacity-60">{busy ? "Adding…" : "Connect"}</button>
      </form>
      {error && <p className="mt-2 text-sm" style={{ color: "#fca5a5" }}>{error}</p>}

      {apps.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((a) => (
            <div key={a.id} className="relative">
              <AppThumbnail app={a} />
              <button
                onClick={() => remove(a)}
                className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-red-600"
                title="Disconnect"
                aria-label={`Disconnect ${a.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="fx-surface p-6" style={{ background: "var(--surface-solid)" }}>
      <h2 className="font-display text-lg font-semibold fx-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Input({
  label, value, onChange, type = "text", required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium fx-text">{label}</label>
      <input type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="fx-field mt-1" />
    </div>
  );
}

function Textarea({
  label, value, onChange, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium fx-text">{label}</label>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className="fx-field mt-1" />
    </div>
  );
}

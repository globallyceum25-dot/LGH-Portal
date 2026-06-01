import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { Company } from "@shared/types";
import { LogoMark } from "@/components/LogoMark";
import { StatusBadge } from "@/components/StatusBadge";
import { GeneratedArt } from "@/components/GeneratedArt";
import { AppThumbnail } from "@/components/AppThumbnail";
import { Spinner, ErrorState } from "@/components/States";

function Fact({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="border-b fx-border py-3 last:border-0">
      <dt className="font-mono text-[11px] font-medium uppercase tracking-wide fx-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium fx-text">{value}</dd>
    </div>
  );
}

export default function PortalCompany() {
  const { companySlug } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.company(companySlug!).then(setCompany).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [companySlug]);

  if (loading) return <Spinner />;
  if (error || !company) return <ErrorState message={error || "Company not found"} />;

  const apps = company.applications ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <header className="fx-glass relative mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-35">
          <GeneratedArt seed={company.logo_seed || company.slug} className="h-full w-full" />
        </div>
        <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center">
          <LogoMark name={company.name} seed={company.logo_seed} size={84} rounded="rounded-2xl" />
          <div className="flex-1">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] fx-accent">Step 3 · Company</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold lg:text-4xl">
                <span className="fx-headline">{company.name}</span>
              </h1>
              <StatusBadge status={company.status} />
            </div>
            <p className="mt-2 text-lg fx-muted">{company.tagline}</p>
          </div>
        </div>
      </header>

      {/* Quick-launch apps marquee — connected tools front and centre */}
      {apps.length > 0 && (
        <section className="fx-marquee mb-8 py-2">
          <div className="fx-marquee__track">
            {[...apps, ...apps].map((a, i) => {
              const host = (() => {
                try { return new URL(a.url).hostname.replace(/^www\./, ""); }
                catch { return a.url; }
              })();
              return (
                <a
                  key={`${a.id}-${i}`}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fx-glass flex shrink-0 items-center gap-2.5 !rounded-full px-3 py-2"
                  title={`Open ${a.name}`}
                >
                  <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-white">
                    <img
                      src={`https://${host}/favicon.ico`}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain"
                      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                    />
                  </span>
                  <span className="text-sm font-medium fx-text whitespace-nowrap">{a.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wide fx-muted whitespace-nowrap">
                    {a.category || "↗"}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Applications — the connected apps */}
      <section className="mb-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold fx-text">Connected applications</h2>
            <p className="mt-1 text-sm fx-muted">
              Launch the tools {company.name} runs. {apps.length} connected.
            </p>
          </div>
        </div>
        {apps.length === 0 ? (
          <div className="fx-glass p-8 text-center text-sm fx-muted">
            No applications connected yet. Add them in the admin area.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apps.map((a) => (
              <AppThumbnail key={a.id} app={a} />
            ))}
          </div>
        )}
      </section>

      {/* Profile + facts */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <article>
            <h2 className="font-display text-2xl font-semibold fx-text">Business profile</h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed fx-muted">{company.overview}</p>
          </article>

          {company.mission && (
            <article className="fx-glass border-l-2 p-6" style={{ borderLeftColor: "var(--accent)" }}>
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] fx-accent">Mission</h3>
              <p className="mt-2 font-display text-xl italic fx-text">“{company.mission}”</p>
            </article>
          )}

          {company.products.length > 0 && (
            <article>
              <h2 className="font-display text-2xl font-semibold fx-text">Products &amp; services</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {company.products.map((p) => (
                  <li key={p} className="fx-glass flex items-center gap-3 px-4 py-3 text-sm font-medium fx-text">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs fx-accent" style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}>✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="fx-glass sticky top-24 p-6">
            <h2 className="font-display text-lg font-semibold fx-text">At a glance</h2>
            <dl className="mt-3">
              <Fact label="Legal name" value={company.legal_name} />
              <Fact label="Sector" value={company.sector_name} />
              <Fact label="Chief Executive" value={company.ceo} />
              <Fact label="Founded" value={company.founded_year} />
              <Fact label="Headquarters" value={company.headquarters} />
              <Fact label="Country" value={company.country} />
              <Fact label="Employees" value={company.employees} />
              <Fact label="Revenue" value={company.revenue} />
            </dl>
            {(company.email || company.phone || company.website) && (
              <div className="mt-5 border-t fx-border pt-5">
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wide fx-muted">Contact</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {company.website && (
                    <li><a className="fx-link" href={company.website} target="_blank" rel="noopener noreferrer">{company.website.replace(/^https?:\/\//, "")}</a></li>
                  )}
                  {company.email && <li><a className="fx-link" href={`mailto:${company.email}`}>{company.email}</a></li>}
                  {company.phone && <li className="fx-text">{company.phone}</li>}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
